import { command } from '../../_shared/cmd/cmd';
import { FS } from '../../_shared/fs/fs';
import { LOG } from '../../_shared/log/log';
LOG.OK(' API is running...more!!');


const REPO_URL = `https://api.github.com/orgs/codeformuenster/repos?per_page=100&page=1`;
const FILE = './repos.json';
const TARGET_FILE = './src/_data/repos.json';
const result = command(`curl ${REPO_URL}`);

if (!FS.hasFile(FILE)) {
    LOG.WARN('repos.json does not exist, creating it...');
    FS.writeFile(FILE, result, 'replace');
} else {
    LOG.INFO('repos.json already exists, skipping creation.');
}

const content: string = FS.readFile(FILE);
const json = JSON.parse(content);
// console.log(json);
// console.log(typeof json)

type PROPERTY = {
    count: number;
}

type RESULT = {
    data: PROJECTS;
    properties: {
        [key: string]: PROPERTY;
    };
};

const finalData: RESULT = {
    data: {},
    properties: {},
};

type PROJECTS = {
    [key: string]: {
        avatar_url: string;
        full_name: string;
        name: string;
        private: boolean;
        description: string;
        created_at: string;
        updated_at: string;
        pushed_at: string;
        homepage: string;
        language: string;
        forks_count: number;
        has_Issues: boolean;
        open_issues_count: number;
        license: 'string';
        forks: number;
        topics: string[];
        visibility: 'public' | 'private';
        default_branch: string;
        watchers: number;
        stargazers_count: number;
        subscribers_count: number;
        archived: boolean;
        disabled: boolean;
        pulls_count: number;
        attributes: string[];
    };
};
// TODO: stargazers, deployments

const projects: PROJECTS = {};
const properties = []

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
    LOG.OK(`${KEY}`);
}
finalData.data = projects;

FS.writeFile(TARGET_FILE, finalData, 'replace');
// console.log(result);

// idead get github repos
