import * as cp from 'child_process';
import * as path from 'path';
import * as process from 'process';
import { BUILD_DIR, BUILD_MAIN_FILENAME } from '../src/config';

/**
 * Enhance the Node.js environment "global" variable to add our own types
 *
 * @see https://stackoverflow.com/a/42304473/2391795
 */
declare global {
  let muteConsole: () => any;
  let muteConsoleButLog: () => any;
  let unmuteConsole: () => any;
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
   * @example .../github-action-store-variable/lib/main.js
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
  describe('should pass when', () => {
    beforeEach(() => {
      // @ts-ignore
      global.console = global.unmuteConsole();
    });

    describe('when storing variables using a special delimiter', () => {
      const options: cp.ExecFileSyncOptions = {
        env: {
          INPUT_VARIABLES: 'VAR=TEST,OTHER_VAR=OTHER_TEST,UNKNOWN_VAR',
          INPUT_DELIMITER: ',',
        },
      };
      const output = exec_lib(options);
      console.log('output:\n', output);

      test('output should display all received variables', () => {
        expect(output.includes('::debug::Received variables: VAR=TEST,OTHER_VAR=OTHER_TEST,UNKNOWN_VAR')).toBe(true);
      });

      test('output should display used delimiter', () => {
        expect(output.includes('::debug::Using delimiter: ","')).toBe(true);
      });

      test('output should display warning about UNKNOWN_VAR not being found', () => {
        expect(output.includes('::warning::Cannot retrieve variable UNKNOWN_VAR')).toBe(true);
      });
    });

    describe('when storing variables', () => {
      const options: cp.ExecFileSyncOptions = {
        env: {
          INPUT_VARIABLES: 'VAR1=1,VAR2=SOME_STRING',
          INPUT_DELIMITER: ',',
        },
      };
      const output = exec_lib(options);
      console.log('output:\n', output);

      test('output should display all received variables', () => {
        expect(output.includes('::debug::Received variables: VAR1=1,VAR2=SOME_STRING')).toBe(true);
      });

      test('output should display used delimiter', () => {
        expect(output.includes('::debug::Using delimiter: ","')).toBe(true);
      });

      test('output should NOT display warning about UNKNOWN_VAR not being found (because we did not try to read it)', () => {
        expect(output.includes('::warning::Cannot retrieve variable UNKNOWN_VAR')).toBe(false);
      });

      describe(`when retrieving previously stored variables`, () => {
        const options: cp.ExecFileSyncOptions = {
          env: {
            INPUT_VARIABLES: 'VAR1,VAR2',
            INPUT_DELIMITER: ',',
          },
        };
        const output = exec_lib(options);
        console.log('output:\n', output);

        test('output should display all received variables', () => {
          expect(output.includes('::debug::Received variables: VAR1,VAR2')).toBe(true);
        });

        test('output should display used delimiter', () => {
          expect(output.includes('::debug::Using delimiter: ","')).toBe(true);
        });

        // Only run those tests on GitHub Actions, as they would fail when ran locally
        if(typeof process.env.GITHUB_ENV !== 'undefined'){
          test('output should NOT display warning about VAR1 not being found (because it was set)', () => {
            expect(output.includes('::warning::Cannot retrieve variable VAR1')).toBe(false);
          });

          test('output should NOT display warning about VAR2 not being found (because it was set)', () => {
            expect(output.includes('::warning::Cannot retrieve variable VAR2')).toBe(false);
          });
        }
      });
    });
  });
});
