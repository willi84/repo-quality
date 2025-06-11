import { round, roundToString, stringToJSON } from './convert';

describe('round()', () => {
    it('full number', () => {
        expect(round(2.34245245)).toBe(2);
        expect(round(2, 2)).toBe(2);
        expect(round(2.1, 0)).toBe(2);
    });
    it('decimals', () => {
        expect(round(2.34245245, 2)).toBe(2.34);
        expect(round('2.34245245', 2)).toBe(2.34);
        expect(round(2.1, 2)).toBe(2.1);
    });
});
describe('roundToString()', () => {
    it('full number', () => {
        expect(roundToString(2.1, 0)).toBe('2');
    });
    it('deciamls', () => {
        expect(roundToString(2.34245245, 2)).toBe('2.34');
        expect(roundToString('2.34245245', 2)).toBe('2.34');
        expect(roundToString(2, 2)).toBe('2.00');
        expect(roundToString(2.1, 2)).toBe('2.10');
    });
});
describe('stringToJSON()', () => {
    it('valid simple JSON', () => {
        const INPUT = `{ "xxx": 2}`;
        const EXPECTED = { data: { xxx: 2 }, isValid: true };
        expect(stringToJSON(INPUT)).toEqual(EXPECTED);
    });
    it('invalid simple JSON without quotes', () => {
        const INPUT = `{ xxx: 2}`;
        const EXPECTED = {
            data: { xxx: 2 },
            isValid: false,
            error: "SyntaxError: Expected property name or '}' in JSON at position 2",
        };
        expect(stringToJSON(INPUT)).toEqual(EXPECTED);
    });
    it('valid complex JSON', () => {
        const INPUT = `{ "xxx": 2, "yyy": "foobar", bla: "blubber", holsten: { "bla": "kosten"}}`;
        const EXPECTED = {
            data: {
                xxx: 2,
                yyy: 'foobar',
                bla: 'blubber',
                holsten: { bla: 'kosten' },
            },
            isValid: false,
            error: 'SyntaxError: Expected double-quoted property name in JSON at position 29',
        };
        expect(stringToJSON(INPUT)).toEqual(EXPECTED);
    });
    // TODO: fix this test
    xit('invalid JSON with missing quotes', () => {
        const INPUT = `{ xxx: 2, "yyy": "foobar", bla: "blubber", holsten: { bla: "kosten"}}`;
        const EXPECTED = {
            data: {
                xxx: 2,
                yyy: 'foobar',
                bla: 'blubber',
                holsten: { bla: 'kosten' },
            },
            isValid: false,
            error: 'SyntaxError: Unexpected non-whitespace character after JSON at position 74',
        };
        expect(stringToJSON(INPUT)).toEqual(EXPECTED);
    });
});
