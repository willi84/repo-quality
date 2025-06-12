import {
    deepMerge,
    detectType,
    detectTypeFromString,
    replaceAll,
} from './tools';
describe('check types', () => {
    describe('detectTypeFromString', () => {
        it('detect boolean', () => {
            expect(detectTypeFromString('true')).toEqual('boolean');
            expect(detectTypeFromString('false')).toEqual('boolean');
            expect(detectTypeFromString('TrUE')).toEqual('boolean');
            expect(detectTypeFromString('False ')).toEqual('boolean');
        });
        it('detect string', () => {
            expect(detectTypeFromString('Ein String ')).toEqual('string');
            expect(detectTypeFromString('a false positive ')).toEqual('string');
        });
        it('check integer', () => {
            expect(detectTypeFromString('3.x')).toEqual('string');
            expect(detectTypeFromString('3')).toEqual('number');
            expect(detectTypeFromString('3.3')).toEqual('number');
            // false positive
            expect(detectTypeFromString('I haxve 3.3 bla')).toEqual('string');
        });
    });
    describe('detectType', () => {
        it('detects primitives', () => {
            expect(detectType(3.2)).toEqual('number');
            expect(detectType(3)).toEqual('number');
            expect(detectType(true)).toEqual('boolean');
            expect(detectType('true')).toEqual('string');
        });
        it('detects object', () => {
            expect(detectType({})).toEqual('object');
            expect(detectType({ xx: 'foo', yy: 3, zz: true })).toEqual(
                'object'
            );
        });
        it('detects array', () => {
            expect(detectType([])).toEqual('array');
        });
    });
});

describe('replaceAll()', () => {
    it('replace detected items', () => {
        const input = 'Das ist ein doppeltes ist hier.';
        const output = 'Das dort ein doppeltes dort hier.';
        expect(replaceAll(input, 'ist', 'dort')).toEqual(output);
    });
});
describe('deepMerge', () => {
    it('merges two objects', () => {
        const target = { a: 1, b: { c: 2 } };
        const source = { b: { d: 3 }, e: 4 };
        const expected = { a: 1, b: { c: 2, d: 3 }, e: 4 };
        expect(deepMerge(target, source)).toEqual(expected);
    });
    it('handles null and undefined', () => {
        expect(deepMerge(null, { a: 1 })).toEqual({ a: 1 });
        expect(deepMerge({ a: 1 }, null)).toEqual({ a: 1 });
        expect(deepMerge(undefined, { a: 1 })).toEqual({ a: 1 });
        expect(deepMerge({ a: 1 }, undefined)).toEqual({ a: 1 });
        expect(deepMerge(null, null)).toEqual(null);
        expect(deepMerge(undefined, undefined)).toEqual(undefined);
        expect(deepMerge(null, undefined)).toEqual(undefined);
        expect(deepMerge(2, 3)).toEqual(3);
        expect(deepMerge('test', 'test2')).toEqual('test2');
        expect(deepMerge(2, 'test')).toEqual('test');
        expect(deepMerge([2], [3])).toEqual([3]);
        expect(deepMerge([2], 'test')).toEqual('test');
    });
});
