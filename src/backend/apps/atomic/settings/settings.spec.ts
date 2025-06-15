// import * as mock from 'mock-fs';
import { getComponents } from './settings';
import { LOG } from '../../../_shared/log/log';
import * as readline from 'readline';

const ICON_FOLDER = '../../../../icons';
describe('SETTINGS', () => {
    describe('getComponents()', () => {
        const ID_ATOM_TS = '*.atom.ts';
        const ID_MOLECULE_TS = '*.molecule.ts';
        const ID_ATOM_CSS = '*.atom.css';
        const BASE_SETTINGS = {
            [ID_ATOM_TS]: `${ICON_FOLDER}/typescript-atom`,
            [ID_MOLECULE_TS]: `${ICON_FOLDER}/typescript-molecule`,
            [ID_ATOM_CSS]: `${ICON_FOLDER}/css-atom`,
        };
        const BTN = 'button';
        const FILE = {
            button_atom_ts: `components/atoms/${BTN}/${BTN}.atom.ts`,
            button_atom_css: `components/atoms/${BTN}/${BTN}.atom.css`,
            button_atom_foo: `components/atoms/${BTN}/${BTN}.atom.foo`,
            button_molecule_ts: `components/molecules/${BTN}/${BTN}.molecule.ts`,
            button_organism_ts: `components/organisms/${BTN}/${BTN}.organism.ts`,
        };
        const ICONS: string[] = [
            `${ICON_FOLDER}/typescript-atom`,
            `${ICON_FOLDER}/typescript-molecule`,
            `${ICON_FOLDER}/css-atom`,
            `${ICON_FOLDER}/css-molecule`,
        ];
        let spyLog: jest.SpyInstance;
        beforeEach(() => {
            spyLog = jest.spyOn(LOG, 'logger');
        });
        afterEach(() => {
            jest.clearAllMocks();
            spyLog.mockRestore();
            // clear output if tests successful, uncomment for debugging
            readline.cursorTo(process.stdout, 0, 0);
        });
        describe('different component types', () => {
            it('should add atom file of type to settings', () => {
                const ICON = 'typescript-atom';
                const KEY = ID_ATOM_TS;
                const FILES = [FILE.button_atom_ts];
                const settings = {};
                const components = getComponents(FILES, ICONS, settings);
                const EXPECTED_COMPONENTS = {
                    [KEY]: BASE_SETTINGS[ID_ATOM_TS],
                };
                expect(components).toEqual(EXPECTED_COMPONENTS);
                expect(spyLog).toHaveBeenCalledWith(
                    'OK',
                    `Added to Settings ${KEY} with icon: "${ICON}"`,
                    expect.any(Object)
                );
            });
            it('should add molecule file of type to settings', () => {
                const ICON = 'typescript-molecule';
                const KEY = ID_MOLECULE_TS;
                const FILES = [FILE.button_molecule_ts];
                const settings = {};
                const components = getComponents(FILES, ICONS, settings);
                const EXPECTED_COMPONENTS = {
                    [KEY]: BASE_SETTINGS[ID_MOLECULE_TS],
                };
                expect(components).toEqual(EXPECTED_COMPONENTS);
                expect(spyLog).toHaveBeenCalledWith(
                    'OK',
                    `Added to Settings ${KEY} with icon: "${ICON}"`,
                    expect.any(Object)
                );
            });
        });
        describe('different file types', () => {
            it('should add atom file of type to settings', () => {
                const ICON = 'typescript-atom';
                const KEY = ID_ATOM_TS;
                const FILES = [FILE.button_atom_ts];
                const settings = {};
                const components = getComponents(FILES, ICONS, settings);
                const EXPECTED_COMPONENTS = {
                    [KEY]: BASE_SETTINGS[ID_ATOM_TS],
                };
                expect(components).toEqual(EXPECTED_COMPONENTS);
                expect(spyLog).toHaveBeenCalledWith(
                    'OK',
                    `Added to Settings ${KEY} with icon: "${ICON}"`,
                    expect.any(Object)
                );
            });
            it('should add atom file of type to settings', () => {
                const ICON = 'css-atom';
                const KEY = ID_ATOM_CSS;
                const FILES = [FILE.button_atom_css];
                const settings = {};
                const components = getComponents(FILES, ICONS, settings);
                const EXPECTED_COMPONENTS = {
                    [KEY]: BASE_SETTINGS[ID_ATOM_CSS],
                };
                expect(components).toEqual(EXPECTED_COMPONENTS);
                expect(spyLog).toHaveBeenCalledWith(
                    'OK',
                    `Added to Settings ${KEY} with icon: "${ICON}"`,
                    expect.any(Object)
                );
            });
            it('should ignore unknown file-types', () => {
                const file = 'button.atom.foo';
                // const KEY = ID_ATOM_CSS;
                const FILES = [FILE.button_atom_foo];
                const settings = {};
                const components = getComponents(FILES, ICONS, settings);
                const EXPECTED_COMPONENTS = {};
                expect(components).toEqual(EXPECTED_COMPONENTS);
                expect(spyLog).toHaveBeenCalledWith(
                    'WARN',
                    `Unknown file type for ${file}, skipping...`,
                    expect.any(Object)
                );
            });
        });
        it('should not add file type if already exists', () => {
            const ICON = 'typescript-atom';
            const KEY = ID_ATOM_TS;
            const FILES = [FILE.button_atom_ts];
            const settings = { [KEY]: `${ICON_FOLDER}/${ICON}` };
            const components = getComponents(FILES, ICONS, settings);
            const EXPECTED_COMPONENTS = { [KEY]: BASE_SETTINGS[ID_ATOM_TS] };
            expect(components).toEqual(EXPECTED_COMPONENTS);
            expect(spyLog).toHaveBeenCalledWith(
                'OK',
                `Settings already has ${KEY} with icon: "${ICON}"`,
                expect.any(Object)
            );
        });
        it('should extend file types if not exists', () => {
            const ICON = 'typescript-atom';
            const KEY = ID_ATOM_TS;
            const FILES = [FILE.button_atom_ts];
            const settings = {
                [ID_MOLECULE_TS]: BASE_SETTINGS[ID_MOLECULE_TS],
            };
            const components = getComponents(FILES, ICONS, settings);
            const EXPECTED_COMPONENTS = {
                [ID_ATOM_TS]: BASE_SETTINGS[ID_ATOM_TS],
                [ID_MOLECULE_TS]: BASE_SETTINGS[ID_MOLECULE_TS],
            };
            expect(components).toEqual(EXPECTED_COMPONENTS);
            expect(spyLog).toHaveBeenCalledWith(
                'OK',
                `Added to Settings ${KEY} with icon: "${ICON}"`,
                expect.any(Object)
            );
        });
    });
});
