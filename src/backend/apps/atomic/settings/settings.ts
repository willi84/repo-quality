import { FS } from '../../../_shared/fs/fs';
import { LOG } from '../../../_shared/log/log';

const FILE_TYPES: { [key: string]: string } = {
    ts: 'typescript',
    css: 'css',
    md: 'markdown',
    html: 'html',
    json: 'json',
    js: 'javascript',
    njk: 'nunjucks',
};

export const getComponents = (
    files: string[],
    icons: string[],
    settings: any
) => {
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
            LOG.WARN(`Unknown file type for ${fileName}, skipping...`);
            return;
        }
        if (!settings[key]) {
            settings[key] = icon;
            LOG.OK(`Added to Settings ${key} with icon: "${iconName}"`);
        } else {
            LOG.OK(`Settings already has ${key} with icon: "${iconName}"`);
        }
    });
    return settings;
};
