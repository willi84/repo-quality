import { HTTPStatusBase } from '../..';
import { command } from '../../_shared/cmd/cmd';
import { FS } from '../../_shared/fs/fs';
import { getHttpItem } from '../../_shared/http/http';
import { LOG } from '../../_shared/log/log';
import { CurlItem, ITEM, PROJECTS, RESULT } from './index.d';

const ENV = process.env.NODE_ENV;
const GITHUB_TOKEN = process.env.GITHUB_REPO_QUALITY_PAT || '';
const ACTIVE_WALLABY = process.env.WALLABY || '';
const isWallaby = ACTIVE_WALLABY && ACTIVE_WALLABY === 'true';
console.log('ACTIVE_WALLABY');
console.log(ACTIVE_WALLABY);
const isDEV = ENV !== 'production';
const hasToken = GITHUB_TOKEN && GITHUB_TOKEN !== '';

const remainingTokenWarning = (all: number, remaining: number) => {
    const percent = Math.round((remaining / all) * 100);
    const isLow = percent < 10;
    const isCritical = percent < 5;
    const type = isCritical ? 'FAIL' : isLow ? 'WARN' : 'OK';
    const doProceed = percent > 10;
    const context = `🔋 GitHub API token remaining: `;
    LOG[type](`${context} ${remaining} of ${all} (${percent}%)`);
    return doProceed;
};

LOG.OK(`📊 run repo check (isDev: ${isDEV} | hasToken: ${hasToken})`);
console.log(isDEV)
const REPO_URL = `https://api.github.com/orgs/codeformuenster/repos?per_page=100&page=1`;
const RAW_URL = `https://raw.githubusercontent.com/willi84/coconat.space/refs/heads/main/tsconfig.json`;
const FILE = './repos.json';
const TARGET_FILE = './src/_data/repos.json';
let result = '';
let doCreate = false;

const getHttpProp = (httpItem: HTTPStatusBase, keys: string | string[]) => {
    let result: string = '';
    if (typeof keys === 'string') {
        result = httpItem[keys];
    } else if (Array.isArray(keys)) {
        for (const key of keys) {
            const value = httpItem[key];
            if (value) {
                result = value;
            }
        }
    }
    return result;
};

// TODO: ins http-Modul
const getResponse = (url: string, token: string, isDev: boolean): CurlItem => {
    const isGithub = url.indexOf('github.com') !== -1;
    const isGithubApi = url.indexOf('api.github.com') !== -1;

    // `curl -H "Authorization: token ${token}" -H "User-Agent: nodejs" ${url}`
    if (isGithubApi && !GITHUB_TOKEN) {
        LOG.FAIL('Please set a GITHUB_TOKEN in the environment variables.');
        return {
            header: {},
            content: '',
            status: '0',
            success: false,
        };
    } else {
        const auth = isGithubApi ? `-H "Authorization: token ${token}" ` : '';
        const ua = isGithubApi ? '' : '-H "User-Agent: nodejs" ';
        const data = command(`curl -s ${auth} ${ua} -i ${url} `);
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
        if (isGithubApi) {
            const keysRemain = ['x-ratelimit-remaining', 'xRatelimitRemaining'];
            const keysLimit = ['x-ratelimit-limit', 'xRatelimitLimit'];
            const remaining = parseInt(getHttpProp(httpItem, keysRemain), 10);
            const limit = parseInt(getHttpProp(httpItem, keysLimit), 10);
            if (remaining && limit) {
                remainingTokenWarning(limit, remaining);
            } else {
                LOG.WARN('No rate limit information found in response headers');
            }
        }

        return {
            header: httpItem,
            content: content,
            status: status.toString(),
            success: success,
        };
    }
};

// const response = getResponse(REPO_URL, GITHUB_TOKEN, isDEV);

// remainingTokenWarning(5000, 4000);
// remainingTokenWarning(5000, 401);
// remainingTokenWarning(5000, 5);
// console.log(response);

// const content1 = response.split('\n').slice(1).join('\n');
// console.log(content1);
const shouldUpdate = (FILE: string, isDEV: boolean) => {
    let doCreate = false;
    const filename = FILE.split('/').pop() || '';
    const prefix = `[${filename}] `;
    if (!isDEV) {
        doCreate = true;
        LOG.WARN('Skipping cache of repos.json in production mode.');
    } else if (!FS.hasFile(FILE)) {
        LOG.WARN(`${prefix} does not exist, creating it...`);
        doCreate = true;
    } else {
        const cnt = FS.readFile(FILE);
        if (!cnt) {
            doCreate = true;
            LOG.WARN(`${prefix} is empty, creating a new one...`);
        } else {
            if (cnt.trim().length === 0) {
                doCreate = true;
            } else {
                const isJSSON = FILE.endsWith('.json');
                if (isJSSON) {
                    try {
                        const json = JSON.parse(cnt);
                        if (json.message) {
                            LOG.WARN(`${prefix} wrong JSON, creating new...`);
                            doCreate = true;
                        }
                    } catch (e: any) {
                        doCreate = true;
                        LOG.WARN(`${prefix} is not valid, creating new...`);
                    }
                }
            }
        }
        // LOG.INFO('repos.json already exists, skipping creation.');
    }
    if (!doCreate) {
        LOG.INFO(`${prefix} already exists and not empty, skipping creation.`);
        // result = command(`curl ${REPO_URL}`);
        // FS.writeFile(FILE, result, 'replace');
    }
    return doCreate;
};

//  curl -i https://raw.githubusercontent.com/willi84/coconat.space/refs/heads/main/readme.md
const versions = ['readme.md', 'README.md', 'README.MD', 'README', 'readme'];
const getReadmeUrl = (full_name: string, branch: string): ITEM => {
    const baseUrl = `https://raw.githubusercontent.com/${full_name}/refs/heads/${branch}`;
    for (const version of versions) {
        const url = `${baseUrl}/${version}`;
        const response = getResponse(url, GITHUB_TOKEN, isDEV);
        if (response.success) {
            LOG.INFO(`Found README at ${url}`);
            return {
                url: url,
                content: response.content,
                success: response.success,
            };
        }
    }
    LOG.WARN(`No README found for ${full_name} on branch ${branch}`);
    return { url: '', content: '', success: false };
};

const createData = (FILE: string, content: string, isDEV: boolean) => {
    const json = JSON.parse(content);
    // console.log(typeof json)

    const finalData: RESULT = {
        data: {},
        properties: {},
    };

    // TODO: stargazers, deployments

    const projects: PROJECTS = {};
    const properties = [];
    if (Array.isArray(json) === false) {
        LOG.FAIL('repos.json is not an array, please check the file format.');
        process.exit(1);
    }

    for (const repo of json) {
        const KEY: string = `${repo.full_name || 'none'}`;
        if (projects[KEY] || KEY === 'none') {
            LOG.WARN(`Repo ${KEY} already exists, skipping...`);
            // continue; // Skip if the repo already exists
        } else {
            projects[KEY] = {
                full_name: repo.full_name,
                name: repo.name,
                avatar_url: repo.owner.avatar_url,
                private: repo.private,
                description: repo.description || '',
                created_at: repo.created_at,
                updated_at: repo.updated_at,
                pushed_at: repo.pushed_at,
                homepage: repo.homepage || '',
                language: repo.language || '',
                forks_count: repo.forks_count,
                has_Issues: repo.has_issues,
                open_issues_count: repo.open_issues_count,
                license: repo.license ? repo.license.name : '',
                forks: repo.forks,
                topics: repo.topics || [],
                visibility: repo.visibility,
                default_branch: repo.default_branch,
                watchers: repo.watchers,
                stargazers_count: repo.stargazers_count,
                subscribers_count: -1,
                archived: repo.archived,
                disabled: repo.disabled,
                pulls_count: repo.pulls_count || -1, // Assuming pulls_count is not in the original data
                headlines: [],
                attributes: [],
            };
            projects[KEY].attributes.push('github');
            if (repo.topics && repo.topics.length > 0) {
                projects[KEY].attributes.push(...repo.topics);
            }
            if (repo.private) {
                projects[KEY].attributes.push('private');
            }
            if (repo.archived) {
                projects[KEY].attributes.push('archived');
            }
            if (repo.disabled) {
                projects[KEY].attributes.push('disabled');
            }
            if (repo.homepage) {
                projects[KEY].attributes.push('homepage');
            }
            if (repo.language) {
                projects[KEY].attributes.push(repo.language.toLowerCase());
            }
            if (repo.license) {
                projects[KEY].attributes.push(repo.license.name.toLowerCase());
            }
            // check all props
            const props = Object.keys(projects[KEY]);
            for (const prop of props) {
                if (!finalData.properties[prop]) {
                    finalData.properties[prop] = {
                        count: 0,
                    };
                } else {
                    finalData.properties[prop].count += 1;
                }
            }
        }
        const readme = getReadmeUrl(repo.full_name, repo.default_branch);
        if (readme.success) {
            const h1 = readme.content.match(/#\s+(.*)/g);
            if (h1 && h1.length > 0) {
                projects[KEY].headlines = h1.map((h) => h.replace(/#\s+/, '').trim());
            } else {
                LOG.WARN(`No headline found in README for ${repo.full_name}`);
            }
            // console.log(h1);
        }

        // LOG.OK(`${KEY}`);
    }
    finalData.data = projects;
    return finalData;
    // console.log(result);

    // idead get github repos
};

// const response = getResponse(RAW_URL, GITHUB_TOKEN, isDEV);
// console.log('response');

const doUpdate = shouldUpdate(FILE, isDEV);
let content = '';
if (doUpdate) {
    LOG.INFO(`Creating ${FILE}...`);
    const responseData = getResponse(REPO_URL, GITHUB_TOKEN, isDEV);
    // const response = getResponse(RAW_URL, GITHUB_TOKEN, isDEV);
    if (!responseData.success) {
        LOG.FAIL(`Failed to fetch data from ${RAW_URL}`);
        process.exit(1);
    }
    // content = finalData.content;
    FS.writeFile(FILE, responseData.content, 'replace');
}
content = FS.readFile(FILE);
if (!content) {
    LOG.FAIL(`Failed to read data from ${FILE}`);
    process.exit(1);
}
const finalData = createData(FILE, content, isDEV);
// result = command(`curl -s ${REPO_URL}`);
FS.writeFile(TARGET_FILE, finalData, 'replace');
// finalData.data = projects;

// FS.writeFile(TARGET_FILE, finalData, 'replace');
