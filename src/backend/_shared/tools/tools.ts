import { DOM, DOMS } from './tools.d';
const NUM_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ','];

export const replaceAll = (
    input: string,
    search: string,
    replacement: string
): string => {
    return input.split(search).join(replacement);
};

export const detectTypeFromString = (rawValue: string) => {
    const value = rawValue.toLowerCase().trim();
    const booleans = ['true', 'false'];
    let isBoolean = false;
    booleans.forEach((bool: string) => {
        if (bool === value.toLowerCase().trim()) {
            isBoolean = true;
        }
    });
    try {
        // check if value just consists of those
        let testValue = value;
        NUM_VALUES.forEach((num: string) => {
            testValue = replaceAll(testValue, num, '');
        });
        const isNumber = testValue.trim() === '';
        if (isNumber) {
            return 'number';
        }
    } catch (e: any) {}
    if (isBoolean) {
        return 'boolean';
    } else {
        return 'string';
    }
    // TODO: Array, urls, number, object
};
export const detectType = (value: any) => {
    const isArray = Array.isArray(value);
    const isObject = typeof value === 'object' && !isArray;
    if (isObject) {
        return 'object';
    } else if (isArray) {
        return 'array';
    } else {
        return typeof value;
    }
};

export const deepMerge = (target: any, source: any): any => {
    if (target === null || target === undefined) return clone(source);
    if (source === null || source === undefined) return clone(target);

    if (typeof target !== 'object' || typeof source !== 'object') {
        return clone(source);
    }

    const merged: any = Array.isArray(target) ? [...target] : { ...target };

    for (const key of Object.keys(source)) {
        const srcVal = source[key];
        const tgtVal = target[key];

        if (isObject(srcVal) && isObject(tgtVal)) {
            merged[key] = deepMerge(tgtVal, srcVal);
        } else {
            merged[key] = clone(srcVal);
        }
    }

    return merged;
};

const isObject = (val: any): val is Record<string, any> =>
    val !== null && typeof val === 'object' && !Array.isArray(val);

const clone = (val: any): any => {
    return val !== undefined && typeof val === 'object'
        ? JSON.parse(JSON.stringify(val))
        : val;
};

export const select = (query: string, target?: DOM): DOM => {
    const base = target || document;
    return base?.querySelector(query) as DOM;
};

export const selectAll = (query: string, target?: DOM): DOMS => {
    const base = target || document;
    return base?.querySelectorAll(query) as DOMS;
};
