import {
    getConnectionTime,
    getHttpItem,
    getHTTPStatus,
    getHttpStatus,
    getHttpStatusItem,
    getNumberString,
    splitLine,
    transformKey,
} from './http';
import * as cmd from '../cmd/cmd';
import { HTTP_OBJECT, MOCKED_URLS, DOMAIN_1 } from './http.mocks';
import { getMockedResponse, MOCKED_RESPONSES } from './http.helper';

describe('helper', () => {
    describe('getNumberString()', () => {
        it('should return number string for integer', () => {
            expect(getNumberString(123)).toEqual('123');
            expect(getNumberString(0)).toEqual('0');
            expect(getNumberString(-1)).toEqual('-1');
        });
        it('should return number string for float', () => {
            expect(getNumberString(123.456)).toEqual('123.456');
            expect(getNumberString(0.123)).toEqual('0.123');
            expect(getNumberString(-1.234)).toEqual('-1.234');
        });
        it('should return number string for negative float', () => {
            expect(getNumberString(-123.456)).toEqual('-123.456');
            expect(getNumberString(-0.123)).toEqual('-0.123');
            expect(getNumberString(-1.234)).toEqual('-1.234');
        });
    });
    describe('splitLine()', () => {
        describe('split line with colon', () => {
            it('should split line with simple key/value', () => {
                const INPUT = 'KEY: value';
                const EXPECTED = { key: 'KEY', value: 'value' };
                expect(splitLine(INPUT)).toEqual(EXPECTED);
            });
            it('should split line with multiple values', () => {
                const INPUT = 'KEY: multiple value';
                const EXPECTED = { key: 'KEY', value: 'multiple value' };
                expect(splitLine(INPUT)).toEqual(EXPECTED);
            });
            it('should split line with multiple values with colon', () => {
                const INPUT = 'KEY: multiple: value';
                const EXPECTED = { key: 'KEY', value: 'multiple: value' };
                expect(splitLine(INPUT)).toEqual(EXPECTED);
            });
            it('should split line with key with dash', () => {
                const INPUT = 'KEY-XX: value';
                const EXPECTED = { key: 'KEY-XX', value: 'value' };
                expect(splitLine(INPUT)).toEqual(EXPECTED);
            });
            it('should split line with key with dash and multiple values', () => {
                const INPUT = 'KEY-XX: multiple value';
                const EXPECTED = { key: 'KEY-XX', value: 'multiple value' };
                expect(splitLine(INPUT)).toEqual(EXPECTED);
            });
            it('should split line with key with dash and multiple values with colon', () => {
                const INPUT = 'KEY-XX: multiple: value';
                const EXPECTED = { key: 'KEY-XX', value: 'multiple: value' };
                expect(splitLine(INPUT)).toEqual(EXPECTED);
            });
        });
        describe('split line without colon', () => {
            it('should split line with simple key/value', () => {
                const INPUT = 'KEY value';
                const EXPECTED = { key: 'KEY', value: 'value' };
                expect(splitLine(INPUT)).toEqual(EXPECTED);
            });
            it('should split line with multiple values', () => {
                const INPUT = 'KEY multiple value';
                const EXPECTED = { key: 'KEY', value: 'multiple value' };
                expect(splitLine(INPUT)).toEqual(EXPECTED);
            });
            it('should split line with multiple values with colon', () => {
                const INPUT = 'KEY multiple: value';
                const EXPECTED = { key: 'KEY', value: 'multiple: value' };
                expect(splitLine(INPUT)).toEqual(EXPECTED);
            });
            it('should split line with key with dash', () => {
                const INPUT = 'KEY-XX value';
                const EXPECTED = { key: 'KEY-XX', value: 'value' };
                expect(splitLine(INPUT)).toEqual(EXPECTED);
            });
            it('should split line with key with dash and multiple values', () => {
                const INPUT = 'KEY-XX multiple value';
                const EXPECTED = { key: 'KEY-XX', value: 'multiple value' };
                expect(splitLine(INPUT)).toEqual(EXPECTED);
            });
            it('should split line with key with dash and multiple values with colon', () => {
                const INPUT = 'KEY-XX multiple: value';
                const EXPECTED = { key: 'KEY-XX', value: 'multiple: value' };
                expect(splitLine(INPUT)).toEqual(EXPECTED);
            });
            it('should split line with key with dash and multiple values with colon after first space', () => {
                const INPUT = 'KEY-XX multiple: value';
                const EXPECTED = { key: 'KEY-XX', value: 'multiple: value' };
                expect(splitLine(INPUT)).toEqual(EXPECTED);
            });
        });
    });
    describe('transformKey()', () => {
        it('should transform key', () => {
            expect(transformKey('HTTP/1.1')).toEqual('http/1.1');
            expect(transformKey('Location')).toEqual('location');
            expect(transformKey('location')).toEqual('location');
            expect(transformKey('Content-Type')).toEqual('contentType');
            expect(transformKey('content-type')).toEqual('contentType');
            expect(transformKey('X-Frame-Options')).toEqual('xFrameOptions');
        });
    });
    describe('getHTTPStatus()', () => {
        let mockCommand: jest.SpyInstance;
        beforeEach(() => {
            mockCommand = jest
                .spyOn(cmd, 'command')
                .mockImplementation(getMockedResponse);
        });
        afterEach(() => {
            mockCommand.mockRestore();
        });
        it('should result a 200 at forward step2', () => {
            const INPUT = MOCKED_URLS.HTTP_200.step1;
            const EXPECTED = HTTP_OBJECT.HTTP_200;
            expect(getHTTPStatus(INPUT)).toEqual(EXPECTED);
        });
        it('should result a 200 at forward step2', () => {
            const INPUT = MOCKED_URLS.HTTP_200.step1;
            const EXPECTED = HTTP_OBJECT.HTTP_200;
            const result = getHTTPStatus(INPUT, 2);
            expect(result).toEqual(EXPECTED);
        });
        it('should result a 200 at forward step2', () => {
            const INPUT = MOCKED_URLS.HTTP_200.step1;
            const EXPECTED = HTTP_OBJECT.HTTP_200;
            const result = getHTTPStatus(INPUT, 0.2);
            expect(result).toEqual(EXPECTED);
        });
    });
    describe('getHttpItem()', () => {
        it('should result a 200 at forward step2', () => {
            const INPUT = MOCKED_RESPONSES.HTTP_200_FORWARD_1.step2;
            const EXPECTED = HTTP_OBJECT.HTTP_200;
            expect(getHttpItem(INPUT)).toEqual(EXPECTED);
        });
        it('should result a 301 at forward step1', () => {
            const INPUT = MOCKED_RESPONSES.HTTP_200_FORWARD_1.step1;
            const EXPECTED = HTTP_OBJECT.HTTP_301;
            expect(getHttpItem(INPUT)).toEqual(EXPECTED);
        });
        it('should result a 404 at forward step3', () => {
            const INPUT = MOCKED_RESPONSES.HTTP_404_FORWARD.step3;
            const EXPECTED = HTTP_OBJECT.HTTP_404;
            expect(getHttpItem(INPUT)).toEqual(EXPECTED);
        });
    });
});
describe('http status', () => {
    describe('getHttpStatus()', () => {
        let mockCommand: jest.SpyInstance;
        beforeEach(() => {
            mockCommand = jest
                .spyOn(cmd, 'command')
                .mockImplementation(getMockedResponse);
        });
        afterEach(() => {
            mockCommand.mockRestore();
        });
        describe('get next step response', () => {
            it('return 0', () => {
                const INPUT = MOCKED_URLS.HTTP_UNKOWN.step1;
                expect(getHttpStatus(INPUT)).toEqual('0');
            });
            it('return 200 direct', () => {
                const INPUT = MOCKED_URLS.HTTP_200.step1;
                expect(getHttpStatus(INPUT)).toEqual('200');
            });
            it('return 200 with forward', () => {
                const INPUT = MOCKED_URLS.HTTP_200_FORWARD_1.step2;
                expect(getHttpStatus(INPUT)).toEqual('200');
            });
            it('return 301', () => {
                const INPUT = MOCKED_URLS.HTTP_200_FORWARD_1.step1;
                expect(getHttpStatus(INPUT)).toEqual('301');
            });
            it('return 404', () => {
                const INPUT = MOCKED_URLS.HTTP_404.step1;
                expect(getHttpStatus(INPUT)).toEqual('404');
            });
            it('return 404 with forward', () => {
                const INPUT = MOCKED_URLS.HTTP_404_FORWARD.step1;
                expect(getHttpStatus(INPUT)).toEqual('301');
            });
            it('return 404 with forward step2', () => {
                const INPUT = MOCKED_URLS.HTTP_404_FORWARD.step2;
                expect(getHttpStatus(INPUT)).toEqual('301');
            });
            it('return 404 with forward step3', () => {
                const INPUT = MOCKED_URLS.HTTP_404_FORWARD.step3;
                expect(getHttpStatus(INPUT)).toEqual('404');
            });
        });
        describe('get last step response', () => {
            it('return 0', () => {
                const INPUT = MOCKED_URLS.HTTP_404_FORWARD_MAX.step1;
                expect(getHttpStatus(INPUT, true)).toEqual('0');
            });
            it('return 200 with forward 1', () => {
                const INPUT = MOCKED_URLS.HTTP_200_FORWARD_1.step1;
                expect(getHttpStatus(INPUT, true)).toEqual('200');
            });
            it('return 200 with forward 2', () => {
                const INPUT = MOCKED_URLS.HTTP_200_FORWARD_2.step1;
                expect(getHttpStatus(INPUT, true)).toEqual('200');
            });
            it('return 404', () => {
                const INPUT = MOCKED_URLS.HTTP_404_FORWARD.step1;
                expect(getHttpStatus(INPUT, true)).toEqual('404');
            });
            it('return 0 with forward max', () => {
                const INPUT = MOCKED_URLS.HTTP_404_FORWARD_MAX.step1;
                expect(getHttpStatus(INPUT, true)).toEqual('0');
            });
            it('return 200 with forward 1 step2', () => {
                const INPUT = MOCKED_URLS.HTTP_200_FORWARD_1.step1;
                expect(getHttpStatus(INPUT, true)).toEqual('200');
            });
            it('return 200 with forward 2 step1', () => {
                const INPUT = MOCKED_URLS.HTTP_200_FORWARD_2.step1;
                expect(getHttpStatus(INPUT, true)).toEqual('200');
            });
        });
    });
    describe('getHttpStatusItem()', () => {
        let mockCommand: jest.SpyInstance;
        beforeEach(() => {
            mockCommand = jest
                .spyOn(cmd, 'command')
                .mockImplementation(getMockedResponse);
        });
        afterEach(() => {
            mockCommand.mockRestore();
        });
        it('return 200 direct', () => {
            const INPUT = MOCKED_URLS.HTTP_200.step1;
            const EXPECTED = {
                ...HTTP_OBJECT.HTTP_200,
                lastLocation: `https://www.${DOMAIN_1}/`,
            };
            expect(getHttpStatusItem(INPUT)).toEqual(EXPECTED);
        });
    });
    describe('getConnectionTime()', () => {
        let mockCommand: jest.SpyInstance;
        beforeEach(() => {
            mockCommand = jest.spyOn(cmd, 'command').mockImplementation(() => {
                return '0.123';
            });
        });
        afterEach(() => {
            mockCommand.mockRestore();
        });
        it('should return connection time', () => {
            const INPUT = `https://www.${DOMAIN_1}/`;
            const EXPECTED = '0.123';
            expect(getConnectionTime(INPUT)).toEqual(EXPECTED);
        });
    });
});
