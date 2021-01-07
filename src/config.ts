import { join } from 'path';

/**
 * Directory where the compiled version (JS) of the TS code is stored.
 *
 * XXX Should match the package.json:main value.
 */
export const BUILD_DIR = 'lib';

/**
 * Name of the Action's entrypoint.
 *
 * XXX Should match the package.json:main value.
 */
export const BUILD_MAIN_FILENAME = 'main.js';

/**
 * Artifact directory containing variables artifacts
 */
export const WORKDIR = join(process.cwd(), '_store-variables');
