"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKDIR = exports.BUILD_MAIN_FILENAME = exports.BUILD_DIR = void 0;
const path_1 = require("path");
/**
 * Directory where the compiled version (JS) of the TS code is stored.
 *
 * XXX Should match the package.json:main value.
 */
exports.BUILD_DIR = 'lib';
/**
 * Name of the Action's entrypoint.
 *
 * XXX Should match the package.json:main value.
 */
exports.BUILD_MAIN_FILENAME = 'main.js';
/**
 * Artifact directory containing variables artifacts
 */
exports.WORKDIR = (0, path_1.join)(process.cwd(), '_store-variables');
