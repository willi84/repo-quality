import { createMockData, getGETParameter, mockGetResponse } from './mock';

describe('createMockData()', () => {
    it('should return 0 data-sets', () => {
        const result = createMockData(0);
        expect(result).toEqual([]);
    });
    it('should return 1 data-set', () => {
        const result = createMockData(1);
        expect(result).toEqual([{ id: 1, name: 'Project 1' }]);
    });
    it('should return 5 data-sets', () => {
        const result = createMockData(5);
        expect(result).toEqual([
            { id: 1, name: 'Project 1' },
            { id: 2, name: 'Project 2' },
            { id: 3, name: 'Project 3' },
            { id: 4, name: 'Project 4' },
            { id: 5, name: 'Project 5' },
        ]);
    });
    it('should return 5 data-sets with offset', () => {
        const result = createMockData(4, 3);
        expect(result).toEqual([
            { id: 3, name: 'Project 3' },
            { id: 4, name: 'Project 4' },
        ]);
    });
});
describe('getGETParameter()', () => {
    it('should return null for non-existing parameter', () => {
        const url = 'https://example.com/api?param1=value1&param2=value2';
        const result = getGETParameter(url, 'param3', 'string');
        expect(result).toBeNull();
    });
    it('should return value for existing parameter', () => {
        const url = 'https://example.com/api?param1=value1&param2=value2';
        const result = getGETParameter(url, 'param1', 'string');
        expect(result).toBe('value1');
    });
    it('should return parsed number for numeric parameter', () => {
        const url = 'https://example.com/api?param1=123&param2=value2';
        const result = getGETParameter(url, 'param1', 'number');
        expect(result).toBe(123);
    });
});
describe('mockGetResponse()', () => {
    it('should return mock data with correct structure for page 1', () => {
        const endpoint = 'https://example.com/api/projects?page=1&per_page=2';
        const token = 'dummyToken';
        const result = mockGetResponse(endpoint, token);
        const EXPECTED_DATA = [
            { id: 1, name: 'Project 1' },
            { id: 2, name: 'Project 2' },
        ];
        const EXPECTED = {
            content: JSON.stringify(EXPECTED_DATA),
            header: {
                xTotalPages: '5',
                xTotal: '9',
                xNextPage: '2',
            },
            status: '200',
            success: true,
            time: 100,
        };
        expect(result).toEqual(EXPECTED);
    });
    it('should return mock data with correct structure for page 2', () => {
        const endpoint = 'https://example.com/api/projects?page=2&per_page=2';
        const token = 'dummyToken';
        const result = mockGetResponse(endpoint, token);
        const EXPECTED_DATA = [
            { id: 3, name: 'Project 3' },
            { id: 4, name: 'Project 4' },
        ];
        const EXPECTED = {
            content: JSON.stringify(EXPECTED_DATA),
            header: {
                xTotalPages: '5',
                xTotal: '9',
                xNextPage: '3',
            },
            status: '200',
            success: true,
            time: 100,
        };
        expect(result).toEqual(EXPECTED);
    });
    it('should return mock data with correct structure for page 5', () => {
        const endpoint = 'https://example.com/api/projects?page=5&per_page=2';
        const token = 'dummyToken';
        const result = mockGetResponse(endpoint, token);
        const EXPECTED_DATA = [{ id: 9, name: 'Project 9' }];
        const EXPECTED = {
            content: JSON.stringify(EXPECTED_DATA),
            header: {
                xTotalPages: '5',
                xTotal: '9',
                xNextPage: '',
            },
            status: '200',
            success: true,
            time: 100,
        };
        expect(result).toEqual(EXPECTED);
    });
});
