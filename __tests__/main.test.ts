import * as cp from 'child_process';
import * as path from 'path';
import * as process from 'process';
import {BUILD_DIR, BUILD_MAIN_FILENAME} from '../src/config';

/**
 * Enhance the Node.js environment "global" variable to add our own types
 *
 * @see https://stackoverflow.com/a/42304473/2391795
 */
declare global {
    namespace NodeJS {
        interface Global {
            muteConsole: () => any;
            muteConsoleButLog: () => any;
            unmuteConsole: () => any;
        }
    }
}

/**
 * Executes the compiled version of the Action's main file. (.js)
 *
 * The goal is to test the file that is actually executed by GitHub Action.
 * Additionally, we could also test the TS files, but we didn't do it to avoid over-complicating things (didn't seem necessary).
 *
 * @param options
 */
function exec_lib(options: cp.ExecFileSyncOptions): string {
    /**
     * Path of the node.js binary being used.
     *
     * @example/usr/local/Cellar/node/14.3.0/bin/node
     */
    const nodeBinaryPath = process.execPath;

    /**
     * Path of the compiled version of the Action file entrypoint.
     *
     * @example .../github-action-await-vercel/lib/main.js
     */
    const mainFilePath = path.join(__dirname, '..', BUILD_DIR, BUILD_MAIN_FILENAME);

    try {
        // console.debug(`Running command "${nodeBinaryPath} ${mainFilePath}"`);
        return cp.execFileSync(nodeBinaryPath, [mainFilePath], options).toString();
    } catch (e) {
        console.error(e?.output?.toString());
        console.error(e);
        throw e;
    }
}

describe('Functional test', () => {
    const CORRECT_DOMAIN: string = `${process.env.VERCEL_DOMAIN}`;
    const WRONG_DOMAIN: string = 'i-am-wrong.vercel.app';

    describe('should pass when', () => {
        beforeEach(() => {
            global.console = global.unmuteConsole();
        });

        describe('using default delimiter', () => {
            const options: cp.ExecFileSyncOptions = {
                env: {
                    'INPUT_VARIABLES': "VAR=TEST,OTHER_VAR=OTHER_TEST,RETRIEVE",
                    'INPUT_DELIMITER': ",",
                }
            };
            const filteredContent = exec_lib(options);
            test("test", () => {
                console.log(filteredContent)
            });
        });
    });
});
