// import * as mock from 'mock-fs';
import { DETECTION_STATES, analyzeComponents } from './settings';
import { LOG } from '../../../_shared/log/log';
import * as readline from 'readline';

const ICON_FOLDER = '../../../../icons';
describe('SETTINGS', () => {
    describe('analyzeComponents()', () => {
        const KEYS = {
            ID_ATOM_TS: '*.atom.ts',
            ID_MOLECULE_TS: '*.molecule.ts',
            ID_ATOM_CSS: '*.atom.css',
            ID_ATOM_FOO: '*.atom.foo',
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
        const ICON_KEYS = {
            ID_ATOM_TS: 'typescript-atom',
            ID_MOLECULE_TS: 'typescript-molecule',
            ID_ATOM_CSS: 'css-atom',
            ID_ATOM_FOO: 'unknown-atom',
        };
        describe('different component types', () => {
            it('should add atom file of type to settings', () => {
                const FILES = [FILE.button_atom_ts];
                const settings = {};
                const components = analyzeComponents(FILES, ICONS, settings);
                const EXPECTED = [
                    {
                        file: FILE.button_atom_ts,
                        key: KEYS.ID_ATOM_TS,
                        icon: ICON_KEYS.ID_ATOM_TS,
                        state: DETECTION_STATES.ADDED,
                    },
                ];
                expect(components).toEqual(EXPECTED);
            });
            it('should add molecule file of type to settings', () => {
                const FILES = [FILE.button_molecule_ts];
                const settings = {};
                const components = analyzeComponents(FILES, ICONS, settings);
                const EXPECTED = [
                    {
                        file: FILE.button_molecule_ts,
                        key: KEYS.ID_MOLECULE_TS,
                        icon: ICON_KEYS.ID_MOLECULE_TS,
                        state: DETECTION_STATES.ADDED,
                    },
                ];
                expect(components).toEqual(EXPECTED);
            });
        });
        describe('different file types', () => {
            it('should add atom file of type to settings', () => {
                const FILES = [FILE.button_atom_ts];
                const settings = {};
                const components = analyzeComponents(FILES, ICONS, settings);
                const EXPECTED = [
                    {
                        file: FILE.button_atom_ts,
                        key: KEYS.ID_ATOM_TS,
                        icon: ICON_KEYS.ID_ATOM_TS,
                        state: DETECTION_STATES.ADDED,
                    },
                ];
                expect(components).toEqual(EXPECTED);
            });
            it('should add atom file of type to settings', () => {
                const FILES = [FILE.button_atom_css];
                const settings = {};
                const components = analyzeComponents(FILES, ICONS, settings);
                const EXPECTED = [
                    {
                        file: FILE.button_atom_css,
                        key: KEYS.ID_ATOM_CSS,
                        icon: ICON_KEYS.ID_ATOM_CSS,
                        state: DETECTION_STATES.ADDED,
                    },
                ];
                expect(components).toEqual(EXPECTED);
            });
            it('should ignore unknown file-types', () => {
                const FILES = [FILE.button_atom_foo];
                const settings = {};
                const components = analyzeComponents(FILES, ICONS, settings);
                const EXPECTED = [
                    {
                        file: FILE.button_atom_foo,
                        key: KEYS.ID_ATOM_FOO,
                        icon: ICON_KEYS.ID_ATOM_FOO,
                        state: DETECTION_STATES.NOT_SUPPORTED,
                    },
                ];
                expect(components).toEqual(EXPECTED);
            });
        });
        it('should not add file type if already exists', () => {
            const ICON = ICON_KEYS.ID_ATOM_TS;
            const KEY = KEYS.ID_ATOM_TS;
            const FILES = [FILE.button_atom_ts];
            const settings = { [KEY]: `${ICON_FOLDER}/${ICON}` };
            const components = analyzeComponents(FILES, ICONS, settings);
            const EXPECTED = [
                {
                    file: FILE.button_atom_ts,
                    key: KEYS.ID_ATOM_TS,
                    icon: ICON_KEYS.ID_ATOM_TS,
                    state: DETECTION_STATES.UNCHANGED,
                },
            ];
            expect(components).toEqual(EXPECTED);
        });
    });
});
