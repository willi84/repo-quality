export type PROJECTS = {
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
        headlines: string[];
        attributes: string[];
    };
};
export type CurlItem = {
    header: HTTPStatusBase | {};
    content: string;
    status: string;
    success: boolean;
    time?: number; // Optional, for performance measurement
};
export type PROPERTY = {
    count: number;
};

export type RESULT = {
    data: PROJECTS;
    properties: {
        [key: string]: PROPERTY;
    };
};

export type ITEM = {
    url: string;
    content: string;
    success: boolean;
};
