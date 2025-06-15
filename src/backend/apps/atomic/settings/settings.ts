import { FS } from '../../../_shared/fs/fs';
import { LOG } from '../../../_shared/log/log';

export const DETECTION_STATES = {
    ADDED: 'added',
    // REMOVED: 'removed',
    UNCHANGED: 'unchanged',
    NOT_SUPPORTED: 'not-supported',
    // ERROR: 'error',
};
export type DETECTION_STATE = keyof typeof DETECTION_STATES;

export type ICON_DETECTION = {
    file: string;
    key: string;
    icon: string;
    state: DETECTION_STATE;
};
const FILE_TYPES: { [key: string]: string } = {
    ts: 'typescript',
    css: 'css',
    md: 'markdown',
    html: 'html',
    json: 'json',
    js: 'javascript',
    njk: 'nunjucks',
};

export const analyzeComponents = (
    files: string[],
    icons: string[],
    settings: any
) => {
    const result: ICON_DETECTION[] = [];
    files.forEach((file) => {
        const folderParts = file.split('/');
        const fileName = folderParts[folderParts.length - 1];
        const type = fileName.split('.')[1];
        const fileType = fileName.split('.').slice(2).join('.');
        const key = `*.${type}.${fileType}`;
        const iconPrefix = FILE_TYPES[fileType] || 'unknown';
        let iconName: string = `${iconPrefix}-${type}`;
        const icon =
            icons.filter((icon) => icon.endsWith(iconName))[0] || undefined;
        if (!icon) {
            result.push({
                file: file,
                key: key,
                icon: iconName,
                state: DETECTION_STATES.NOT_SUPPORTED as DETECTION_STATE,
            });
        } else if (!settings[key]) {
            result.push({
                file: file,
                key: key,
                icon: iconName,
                state: DETECTION_STATES.ADDED as DETECTION_STATE,
            });
        } else {
            result.push({
                file: file,
                key: key,
                icon: iconName,
                state: DETECTION_STATES.UNCHANGED as DETECTION_STATE,
            });
        }
    });
    return result;
};
