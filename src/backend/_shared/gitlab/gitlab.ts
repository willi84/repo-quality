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

    // console.log(`fetching: ${TARGET}`)
    const result: CurlItem = getResponse(`${TARGET}`, token, false);
    // console.log(result)
    const maxAvailablePages = parseInt(result?.header['xTotalPages'], 10);
    if (isNaN(maxAvailablePages)) {
        LOG.WARN(`No xTotalPages header found in response from ${TARGET}`);
        console.log(result?.header);
        return [];
    }
    const maxPages = maxPage === -1 ? maxAvailablePages : maxPage;
    if (maxPages < 1) {
        LOG.WARN(`Invalid maxPage value: ${maxPage}`);
        console.log(`maxPage: ${maxPage}, maxAvailablePages: ${maxAvailablePages}`);
        return [];
    }
    LOG.DEBUG(`Max pages: ${maxPages}`);
    if (result?.content === '') {
        return [];
    }
    const projects = JSON.parse(result?.content || '[]');
    console.log(projects[0].id)
    LOG.OK(`[${nextPage}/${maxPages}] received ${projects.length} items from ${TARGET}`);
    for(const project of projects){
        finalResult.push(project)
    }
    // finalResult.push(...projects);
    nextPage = parseInt(result?.header['xNextPage'], 10) || 0;
    if (nextPage > 0) {
        LOG.DEBUG(`Next page: ${nextPage}`);
        for (let i = nextPage; i <= maxPages && i <= maxPages; i++) {
            // pageI = i;
            nextPage = i;
            if (nextPage > maxPages || nextPage === 0) {
                LOG.WARN(`No more items found for ${TARGET} on page ${i}`);
                break;
            }
            const nextCmd = `projects?per_page=${perPage}&page=${nextPage}`;
            const nextTarget = `${endpoint}/${nextCmd}`;
            // console.log(`Fetching next page: ${nextTarget}`);
            const nextResult = getResponse(`${nextTarget}`, token, false);
            if (nextResult && nextResult.content) {
                const nextProjects = JSON.parse(nextResult.content || '[]');
                // const ids = nextProjects.content.map(item => item.id);
                console.log(nextProjects[0].id);
                // console.log(nextProjects.map(item => item.id))
                LOG.OK(
                    `[${nextPage}/${maxPages}] received ${nextProjects.length} items from ${nextTarget}`
                );
                for(const nextProject of nextProjects){
                    finalResult.push(nextProject)
                }
                // finalResult.push(...nextProjects);
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
