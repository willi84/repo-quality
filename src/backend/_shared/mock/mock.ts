import { CurlItem } from '../../apps/api/index.d';
import { LOG } from '../log/log';

const MAX_RETRIES = 3;

export const createMockData = (
    max: number,
    offset?: number
): { id: number; name: string }[] => {
    const mockData = [];
    const start = offset ? offset : 1;
    for (let i = start; i <= max; i++) {
        mockData.push({ id: i, name: `Project ${i}` });
    }
    return mockData;
};
export const getGETParameter = (
    url: string,
    parameter: string,
    type: string
): any => {
    const regex = new RegExp(`[?&]${parameter}=([^&#]*)`);
    const match = url.match(regex);
    if (match && match[1]) {
        switch (type) {
            case 'number':
                return parseInt(match[1], 10);
            case 'string':
                return match[1];
            default:
                return match[1];
        }
    }
    return null;
};
let beFlaky = false;
let retrycount = 0;
const retrycounts: any = {};

export const getSLD = (url: string): string => {
    const match = url.match(/https?:\/\/([^/]+)/);
    if (match && match[1]) {
        const domain = match[1];
        const parts = domain.split('.');
        if (parts.length > 2) {
            return parts.slice(-2)[0]?.replace(/\./g, ''); //.join('.');
        }
        return parts[0];
    }
    return '';
};

export const getFlakyMultiple = (
    beFlaky: boolean,
    url: string,
    scenario: string,
    flakyScenario: Array<number[]> = [],
    retrycounts: any
) => {
    const currentPage = getGETParameter(url, 'page', 'number');

    console.log(scenario);
    // if (!beFlaky) {
    const pageItem = flakyScenario[currentPage - 1];
    const currentRetry = retrycounts[scenario][currentPage] || 0;
    beFlaky = pageItem
        ? pageItem[currentRetry]
            ? pageItem[currentRetry] === 1
            : false
        : false;
    console.log(
        `beflaky: ${beFlaky} | page: ${currentPage} | retry: ${currentRetry}`
    );
    // const firstflake = retrycounts[scenario][currentPage] === 0;
    // beFlaky = firstflake ? true : false;
    if (beFlaky && retrycounts[scenario][currentPage] < MAX_RETRIES) {
        retrycounts[scenario][currentPage]++;
    } else {
        LOG.WARN(`Max retries reached for ${scenario} on page ${currentPage}`);
    }
    // } else {
    //     beFlaky = false;
    // }
    return beFlaky;
};
export const getFlakyOnPage = (
    beFlaky: boolean,
    url: string,
    page: number,
    scenario: string,
    retrycounts: any
) => {
    const currentPage = getGETParameter(url, 'page', 'number');
    if (page === currentPage) {
        if (!beFlaky) {
            const firstflake = retrycounts[scenario][currentPage] === 0;
            beFlaky = firstflake ? true : false;
            if (retrycounts[scenario][currentPage] < MAX_RETRIES) {
                retrycounts[scenario][currentPage]++;
            } else {
                LOG.WARN(
                    `Max retries reached for ${scenario} on page ${currentPage}`
                );
            }
        } else {
            beFlaky = false;
        }
    }
    return beFlaky;
};

export const mockGetResponse = (
    url: string,
    token: string,
    _?: boolean
): CurlItem => {
    const total = 9;
    const totalPages = 5;
    // projects?per_page=${perPage}&page=${nextPage}
    const page = getGETParameter(url, 'page', 'number');
    // console.log(`beFlaky: ${beFlaky} | page: ${page}`);
    const perPage = getGETParameter(url, 'per_page', 'number');
    const domain = url.match(/https?:\/\/([^/]+)/);
    const domainUrl = domain ? domain[0] : '';
    const scenario = getSLD(domainUrl);
    if (!retrycounts[scenario]) {
        retrycounts[scenario] = {};
    }
    if (!retrycounts[scenario][page]) {
        retrycounts[scenario][page] = 0;
    }
    console.log(retrycounts)
    switch (scenario) {
        case 'empty':
            return {
                content: '[]',
                header: { status: '0' },
                status: '200',
                success: true,
                time: 100,
            } as CurlItem;
        case 'flaky':
            beFlaky = getFlakyOnPage(beFlaky, url, 2, scenario, retrycounts);
            break;
        case 'flaky2':
            beFlaky = getFlakyOnPage(beFlaky, url, 3, scenario, retrycounts);
            break;
        case 'flaky1':
            beFlaky = getFlakyOnPage(beFlaky, url, 1, scenario, retrycounts);
            break;
        case 'flakyMultiple':
            beFlaky = getFlakyMultiple(
                beFlaky,
                url,
                scenario,
                [[1, 1, 1, 1, 0]],
                retrycounts
            );
            break;
        case 'flakyMultiple2':
            beFlaky = getFlakyMultiple(
                beFlaky,
                url,
                scenario,
                [[1, 1, 0]],
                retrycounts
            );
            break;
        case 'flakyMultipleTimes':
            beFlaky = getFlakyMultiple(
                beFlaky,
                url,
                scenario,
                [[1, 1, 0], [], [1, 0]],
                retrycounts
            );
            break;
        default:
            beFlaky = false;
            console.log(scenario);
            // retrycounts[scenario] = { count: 1 };
            break;
    }
    const maxValue = perPage * page;
    const nextPage = page ? page + 1 : 2;
    const offset = perPage * (page - 1) + 1;
    const mockData = createMockData(
        maxValue < total ? maxValue : total,
        offset
    );
    const finalData = beFlaky ? mockData[0] : mockData;
    return {
        content: JSON.stringify(finalData),
        header: {
            xTotalPages: `${Math.ceil(total / perPage)}`,
            xTotal: `${total}`,
            xNextPage: `${nextPage < totalPages ? nextPage : ''}`,
        },
        status: '200',
        success: true,
        time: 100,
    } as CurlItem;
};
