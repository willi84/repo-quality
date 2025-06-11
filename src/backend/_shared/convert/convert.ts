import { error } from 'console';
import { LOG } from './../log/log';

type JSONParseResult = {
    data: any;
    isValid: boolean;
    error?: string;
};

type NUM = string | number;

export const round = (wert: NUM, dez = 0) => {
    wert = typeof wert === 'string' ? parseFloat(wert) : wert;
    const umrechnungsfaktor = Math.pow(10, dez);
    let result = Math.round(wert * umrechnungsfaktor) / umrechnungsfaktor;
    return result;
};
export const roundToString = (wert: NUM, dez: number) => {
    wert = typeof wert === 'string' ? parseFloat(wert) : wert;
    const result = round(wert, dez);
    return result.toFixed(dez);
};
export const stringToJSON = (fileStream: string): JSONParseResult => {
    let data;
    let str = fileStream.toString();
    let isValid = true;
    let error = '';
    try {
        JSON.parse(str);
    } catch (e) {
        isValid = false;
        error = e as string;
    }
    // fix missing keys strings
    // { 'key': value}  ==> { "key": value}
    str = str.replace(/([\{|\,])(\s*)\'([^\']*)\'*(\s*):/gi, '$1$2"$3"$4:');

    // { key: value}  ==> { 'key': value}
    str = str.replace(/([\{|\,])(\s*)([^\"|\']*)*(\s*):/gi, '$1$2"$3"$4:');

    // TODO: value has '
    data = JSON.parse(str.toString());
    // str.match(//);

    // TODO unexpected when key is not a string

    const result: JSONParseResult = { data: data, isValid: isValid };
    if (!isValid) {
        result['error'] = `${error}`; // add error to result
    }
    //  Unexpected token ' in JSON at position 47
    return result;
};
