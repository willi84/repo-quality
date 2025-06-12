import { CURL_CONFIG_STATUS } from './http.config';
import { HTTP_UNKNOWN, MOCKED_URLS, MOCKED_HTTP_STATUS } from './http.mocks';

export const getRealResponse = (response: string) => {
    const lines = response.split('\n');

    let newResponse = '';
    lines.forEach((line: string, index: number) => {
        if (index > 0) {
            newResponse += `${line.trim()}\r\n`;
        }
    });
    return newResponse;
};
export const normalizeResponses = (MOCKED_HTTP_STATUS: any) => {
    const MOCKED_RESPONSES: { [key: string]: any } = {};
    const scenarios = Object.keys(MOCKED_HTTP_STATUS);
    scenarios.forEach((scenarioKey: string) => {
        const key = scenarioKey as keyof typeof MOCKED_HTTP_STATUS;
        const scenario = MOCKED_HTTP_STATUS[key];
        const steps = Object.keys(scenario);
        steps.forEach((stepKey: string) => {
            if (!MOCKED_RESPONSES[`${scenarioKey}`]) {
                MOCKED_RESPONSES[`${scenarioKey}`] = {};
            }
            const step = scenario[stepKey as keyof typeof scenario];
            MOCKED_RESPONSES[`${scenarioKey}`][`${stepKey}`] =
                getRealResponse(step);
        });
    });
    return MOCKED_RESPONSES;
};
export const getMockedResponse = (request: string): string => {
    // -m 0.4 --silent
    const regexTimeout = /-m\s+(\d+(\.\d+)?)/;
    const url = request
        .replace('curl -I ', '')
        .replace('--silent', '')
        .replace(regexTimeout, '')
        .trim();
    const scenarios = Object.keys(MOCKED_RESPONSES);
    let result = HTTP_UNKNOWN;
    scenarios.forEach((scenarioKey: string) => {
        const key = scenarioKey as keyof typeof MOCKED_RESPONSES;
        const scenario = MOCKED_RESPONSES[key] as { [key: string]: string };
        const urlKey = scenarioKey as keyof typeof MOCKED_URLS;
        const scenarioURL = MOCKED_URLS[urlKey];
        if (scenarioURL) {
            const steps = Object.keys(scenarioURL);
            steps.forEach((stepKey: string) => {
                if (scenarioURL[stepKey as keyof typeof scenarioURL] === url) {
                    result = scenario[stepKey as keyof typeof scenario];
                }
            });
        }
    });
    return result;
};
export const MOCKED_RESPONSES: { [key: string]: any } =
    normalizeResponses(MOCKED_HTTP_STATUS);
