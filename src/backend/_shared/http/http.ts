/**
 * @license MIT // TODO: not MIT
 * @author Robert Willemelis
 * @module itemsHelper/backend/http
 * @version 1.0.0
 */

import { CurlItem } from '../../apps/api.d';
import { HTTPStatusBase } from '../../index.d';
import { command } from '../cmd/cmd';
import { LOG } from '../log/log';
import { CURL_CONFIG_STATUS, STANDARD_CURL_TIMEOUT } from './http.config';

export const getNumberString = (value: number): string => {
    return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
};
export const splitLine = (line: string) => {
    const matchesColon = line.match(/^([^\s]+)\:\s(.*)/); // KEY: value
    const matchesSpace = line.match(/^([^\s]+)\s(.*)/); // KEY value
    let key = '';
    let value = '';
    if (matchesColon && matchesColon[2]) {
        key = matchesColon[1];
        value = matchesColon[2];
    } else if (matchesSpace && matchesSpace[2]) {
        key = matchesSpace[1];
        value = matchesSpace[2];
    }
    return {
        key: key,
        value: value,
    };
};
export const transformKey = (key: string) => {
    let newKey = key.toLowerCase().trim();
    if (newKey.indexOf('-') !== -1) {
        const parts = newKey.split('-');
        let finalKey = '';
        parts.forEach((part: string, index: number) => {
            if (index === 0) {
                finalKey = part;
            } else {
                finalKey += part.charAt(0).toUpperCase() + part.slice(1);
            }
        });
        newKey = finalKey;
    }
    return newKey;
};

export const getHttpItem = (input: string): HTTPStatusBase => {
    const httpItem: any = {};
    const lines = input
        .split('\n')
        .filter((line: string) => line.trim() !== '');
    lines.forEach((line: string) => {
        const item = splitLine(line);
        const key = transformKey(item.key);

        httpItem[`${key}`] = item.value;
        // detect httpStatus
        if (key.indexOf('http/') === 0) {
            const version = key.split('/')[1];
            httpItem.protocol = 'http';
            httpItem.protocolVersion = version;
            httpItem.status = item.value.split(' ')[0];
            httpItem.statusMessage = item.value
                .replace(httpItem.status, '')
                .trim();
        }
    });
    if (httpItem.status === undefined) {
        httpItem.status = '0';
    }
    return httpItem;
};

export const getHTTPStatus = (
    url: string,
    timeout?: number
): HTTPStatusBase => {
    const oldTime = getNumberString(STANDARD_CURL_TIMEOUT);
    const newTime = getNumberString(timeout || STANDARD_CURL_TIMEOUT);
    let config = timeout
        ? CURL_CONFIG_STATUS.replace(oldTime, newTime)
        : CURL_CONFIG_STATUS;
    const fullCommand = `curl -I ${url} ${config}`;
    const status = command(`${fullCommand}`);
    const httpItem = getHttpItem(status);
    return httpItem;
};

export const getHttpStatus = (
    url: string,
    forwarding = false,
    timeout?: number
) => {
    const httpItem = getHttpStatusItem(url, forwarding, timeout);
    if (httpItem['maxRedirectsReached']) {
        LOG.FAIL(`max redirects reached for ${url}`);
    }
    return httpItem['status'];
};
export const getHttpStatusItem = (
    url: string,
    forwarding = false,
    timeout?: number
): HTTPStatusBase => {
    const initialUrl = url;
    const maxRedirects = 5;
    let redirects = 0;
    let httpItem: HTTPStatusBase = {} as HTTPStatusBase;
    if (forwarding) {
        while (forwarding) {
            redirects += 1;
            httpItem = getHTTPStatus(url, timeout);
            if (redirects > maxRedirects) {
                httpItem['maxRedirectsReached'] = 'true';
                httpItem['lastStatus'] = httpItem['status'];
                httpItem['status'] = '0';
                httpItem['redirects'] = `${redirects}`;
                httpItem['lastLocation'] = url;
                httpItem['initialUrl'] = initialUrl;
                LOG.FAIL(`max redirects reached for ${url}`);
                return httpItem;
            } else {
                // TODO: check valid url
                const location = httpItem['location'];
                if (location) {
                    url = location;
                } else {
                    forwarding = false;
                    httpItem['initialUrl'] = initialUrl; // TODO: testing
                    httpItem['lastLocation'] = url; // TODO: testing
                    httpItem['redirects'] = `${redirects}`;
                    return httpItem;
                }
            }
        }
    } else {
        httpItem = getHTTPStatus(url, timeout);
        httpItem['lastLocation'] = url;
    }
    return httpItem;
};

export const getConnectionTime = (url: string): string => {
    // return just time
    const cmd = `curl -o /dev/null -s -w '%{time_total}\\n' ${url}`;
    const status = command(`${cmd}`);
    return status;
};

export const getResponse = (
    url: string,
    token: string,
    isDev: boolean
): CurlItem => {
    // const isGithub = url.indexOf('github.com') !== -1;
    const isGithubApi = url.indexOf('api.github.com') !== -1;
    const isGitlabApi = url.indexOf('gitlab') !== -1;

    // `curl -H "Authorization: token ${token}" -H "User-Agent: nodejs" ${url}`
    if (isGithubApi && !token) {
        LOG.FAIL('Please set a GITHUB_TOKEN in the environment variables.');
        return {
            header: {},
            content: '',
            status: '0',
            success: false,
        };
    } else {
        // curl --header "PRIVATE-TOKEN: <your_personal_access_token>" "https://gitlab.com/api/v4/projects/123456/repository/files/README.md/raw?ref=main"

        const auth = isGithubApi
            ? `-H "Authorization: token ${token}" `
            : isGitlabApi
                ? `-H "PRIVATE-TOKEN: ${token}" `
                : '';
        const ua = isGithubApi ? '' : '-H "User-Agent: nodejs" ';
        const finalCommand = `curl -s ${auth} ${ua} -i "${encodeURI(url)}" `;
        // console.log(finalCommand)
        const data = command(finalCommand);
        const splitted = data.split(/\r?\n\r?\n/);
        const header = splitted[0];
        const httpItem = getHttpItem(header);
        // all splitted except 0
        const content = splitted.slice(1).join('\n');
        // const content = splitted[1];
        const status = parseInt(httpItem.status || '0', 10) || 0;
        const success = status >= 200 && status < 400;
        if (isDev) {
            const type = success ? 'OK' : 'INFO';
            LOG[type](`Response: ${url}: ${status} - ${httpItem.statusMessage}`);
        }
        // if (isGithubApi) {
        //     const keysRemain = ['x-ratelimit-remaining', 'xRatelimitRemaining'];
        //     const keysLimit = ['x-ratelimit-limit', 'xRatelimitLimit'];
        //     const remaining = parseInt(getHttpProp(httpItem, keysRemain), 10);
        //     const limit = parseInt(getHttpProp(httpItem, keysLimit), 10);
        //     if (remaining && limit) {
        //         remainingTokenWarning(limit, remaining);
        //     } else {
        //         LOG.WARN('No rate limit information found in response headers');
        //     }
        // }

        return {
            header: httpItem,
            content: content,
            status: status.toString(),
            success: success,
        };
    }
};
