import { CurlItem } from '../../apps/api';
import { getResponse } from '../http/http';
import { LOG } from '../log/log';


export const getAllProjects = (
    endpoint: string,
    token: string,
    maxPage: number = -1,
    perPage: number = 100
) => {
    let nextPage = 1;
    const finalResult = [];
    // https://gitlab.opencode.de/api/v4/projects?page=2&per_page=100
    const cmd = `projects?per_page=${perPage}&page=${nextPage}`;
    const TARGET = `${endpoint}/${cmd}`;

    const result: CurlItem = getResponse(`${TARGET}`, token, false);
    // console.log(result)
    const maxAvailablePages = parseInt(result?.header['xTotalPages'], 10);
    const maxPages = maxPage === -1 ? maxAvailablePages : maxPage;
    LOG.DEBUG(`Max pages: ${maxPages}`);
    if (result?.content === '') {
        return [];
    }
    const projects = JSON.parse(result?.content || '[]');
    LOG.OK(`[${nextPage}/${maxPages}] received ${projects.length} items from ${TARGET}`);
    finalResult.push(...projects);
    nextPage = parseInt(result?.header['xNextPage'], 10) || 0;
    if (nextPage > 0) {
        LOG.DEBUG(`Next page: ${nextPage}`);
        for (let i = nextPage; i <= maxPage && i <= maxPages; i++) {
            // pageI = i;
            nextPage = i;
            if (nextPage > maxPages || nextPage === 0) {
                LOG.WARN(`No more items found for ${TARGET} on page ${i}`);
                break;
            }
            const nextCmd = `projects?per_page=${perPage}&page=${nextPage}`;
            const nextTarget = `${endpoint}/${nextCmd}`;
            const nextResult = getResponse(`${nextTarget}`, token, false);
            if (nextResult && nextResult.content) {
                const nextProjects = JSON.parse(nextResult.content || '[]');
                LOG.OK(
                    `[${nextPage}/${maxPages}] received ${nextProjects.length} items from ${nextTarget}`
                );
                finalResult.push(...nextProjects);
            } else {
                LOG.WARN(`No more items found for ${nextTarget} on page ${nextPage}`);
                break;
            }
            // nextPage = parseInt(nextResult?.header['xNextPage'], 10) || 0;
            // console.log(nextResult?.header)
        }
    }
    return finalResult;
};
