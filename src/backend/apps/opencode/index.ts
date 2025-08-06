import { FS } from '../../_shared/fs/fs';
import { getAllProjects } from '../../_shared/gitlab/gitlab';
import { LOG } from '../../_shared/log/log';
import { PROJECTS, RESULT } from '../api/index.d';
// import { PROJECTS, RESULT } from './../index.d';

const GITLAB_TOKEN = process.env.OC_REPO_QUALITY || '';
const FILE = 'src/_data/opencode.json';

export const getData = (max: number, perPage: number = 100) => {
    // const MAX = max === -1 ? 1000 : max;
    const endpoint = 'https://gitlab.opencode.de/api/v4';
    const repos = getAllProjects(endpoint, GITLAB_TOKEN, max, perPage);
    if (repos.length === 0) {
        LOG.FAIL('No projects found.');
        return [];
    }
    LOG.OK(`Found ${repos.length} projects.`);
    const projects: PROJECTS = {};
    const finalData: RESULT = {
        data: {},
        properties: {},
    };
    let i = 0;
    for (const project of repos) {
        const id = project.id.toString();
        projects[id] = {
            id: project.id,
            name: project.name,
            // webUrl: project.webUrl,
            // description: project.description || 'No description',
            // createdAt: project.createdAt,
            // lastActivityAt: project.lastActivityAt,
        };

        if (project.name !== undefined) {
            const name = project.name || '';
            projects[id].name = name.replace(/"/g, '\\"');
        }
        if (project.path_with_namespace !== undefined) {
            const namespace = project.path_with_namespace || '';
            projects[id].pathWithNamespace = namespace.replace(/"/g, '\\"');
        }
        if (project.web_url !== undefined) {
            const webUrl = project.web_url || '';
            projects[id].webUrl = webUrl.replace(/"/g, '\\"');
        }
        if (project.description !== undefined) {
            const description = project.description || '';
            projects[id].description = description.replace(/"/g, '\\"');
        }
        if (project.created_at !== undefined) {
            const createdAt = project.created_at || '';
            projects[id].createdAt = createdAt;
        }
        if (project.last_activity_at !== undefined) {
            const lastActivityAt = project.last_activity_at || '';
            projects[id].lastActivityAt = lastActivityAt;
        }
        if (project.avatar_url !== undefined) {
            const avatar_url = project.avatar_url || '';
            projects[id].avatarUrl = avatar_url.replace(/"/g, '\\"');
        }
        if (project.open_issues_count !== undefined) {
            const openIssuesCount = project.open_issues_count || 0;
            projects[id].openIssuesCount = openIssuesCount;
        }
        if (project.star_count !== undefined) {
            const starCount = project.star_count || 0;
            projects[id].starCount = starCount;
        }
        if (project.forks_count !== undefined) {
            const forksCount = project.forks_count || 0;
            projects[id].forksCount = forksCount;
        }
        if (project.visibility !== undefined) {
            const visibility = project.visibility || 'unknown';
            projects[id].visibility = visibility;
        }
        const props = Object.keys(projects[id]);
        for (const prop of props) {
            if (!finalData.properties[prop]) {
                finalData.properties[prop] = { count: 1 };
            } else {
                finalData.properties[prop].count++;
            }
        }
        // if (i === 0) {
        //     console.log(project);
        //     console.log(projects[id]);
        // }
        i++;
    }
    finalData.data = {...finalData.data, ...projects };
    // finalData.properties = repos[0] ? Object.keys(repos[0]) : [];

    // return projects.map((project: any) => {
    //     return {
    //         id: project.id,
    //         name: project.name,
    //         webUrl: project.web_url,
    //         description: project.description || 'No description',
    //         createdAt: project.created_at,
    //         lastActivityAt: project.last_activity_at,
    //     };
    // });
    return finalData;
};
const IS_DEV = process.env.NODE_ENV !== 'production';
LOG.OK(`Running in ${IS_DEV ? 'development' : 'production'} mode.`);
const MAX_PAGES = IS_DEV ? 3 : -1; // Limit to 10
const getNew = IS_DEV ? !FS.exists(FILE) : true;
if (getNew) {
    LOG.OK('Fetching new data from GitLab...');
    FS.removeFile(FILE);
    const finalData = getData(MAX_PAGES, 50);
    LOG.DEBUG(`Final data: ${Object.keys(finalData.data).length} projects found.`);

    FS.writeFile(FILE, JSON.stringify(finalData, null, 2));
} else {
    LOG.INFO('Using existing data from src/_data/opencode.json');
}

// per_page
