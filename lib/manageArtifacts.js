"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Receive and manage variables
 * Options:
 *  0: Set value "value" to variable "key"
 *  1: Retrieve value from variable "key"
 */
const path_1 = require("path");
const fs_1 = require("fs");
const core = __importStar(require("@actions/core"));
const config_1 = require("./config");
const rimraf_1 = __importDefault(require("rimraf"));
const artifact_1 = require("@actions/artifact");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const io = require('@actions/io');
const defineVariableOperation = (variable) => {
    try {
        const variableContent = {
            key: variable.split('=')[0],
            value: variable.split('=')[1],
        };
        if (typeof variableContent.key !== 'undefined' && typeof variableContent.value !== 'undefined') {
            return {
                operationToProceed: 0,
                detail: variableContent,
            };
        }
        else if (typeof variableContent.key !== undefined) {
            return {
                operationToProceed: 1,
                detail: variableContent,
            };
        }
        else {
            throw Error(`Both key and value are empty`);
        }
    }
    catch (error) {
        // An error will be thrown when the input doesn't have the expected format, or when the operation is unknown
        throw Error(`Input type error: ${error}`);
    }
};
const storeArtifact = (variables, failIfNotFound) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new artifact_1.DefaultArtifactClient();
    const artifactOptions = {
        retentionDays: 1, // Only keep artifacts 1 day to avoid reach limit: https://github.com/actions/toolkit/blob/c861dd8859fe5294289fcada363ce9bc71e9d260/packages/artifact/src/internal/upload-options.ts#L1
    };
    // Used to be able to use type "UploadResponse" but it's not exported by the lib in v2 anymore
    const artifactsUploadPromises = [];
    rimraf_1.default.sync(config_1.WORKDIR);
    (0, fs_1.mkdirSync)(config_1.WORKDIR);
    for (const variable of variables) {
        const file = (0, path_1.join)(config_1.WORKDIR, `${variable.key}.txt`);
        (0, fs_1.writeFileSync)(file, variable.value, { encoding: 'utf8' });
        artifactsUploadPromises.push(client.uploadArtifact(variable.key, [file], process.cwd(), artifactOptions));
    }
    try {
        const uploadResponses = yield Promise.all(artifactsUploadPromises);
        for (const variable of variables) {
            core.exportVariable(variable.key, variable.value);
            core.debug(`Imported ${variable.key}=${variable.value} and exported it back as ENV var`);
        }
    }
    catch (error) {
        const message = `Error while uploading artifact: ${error === null || error === void 0 ? void 0 : error.message}`;
        if (failIfNotFound) {
            core.setFailed(message);
        }
        else {
            core.warning(message);
        }
    }
});
const retrieveArtifact = (variables, failIfNotFound) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new artifact_1.DefaultArtifactClient();
    rimraf_1.default.sync(config_1.WORKDIR);
    (0, fs_1.mkdirSync)(config_1.WORKDIR);
    for (const variable of variables) {
        try {
            const file = (0, path_1.join)(config_1.WORKDIR, `${variable.key}.txt`);
            // @ts-ignore
            yield client.downloadArtifact(variable.key);
            variable.value = (0, fs_1.readFileSync)(file, { encoding: 'utf8' }).toString();
            core.exportVariable(variable.key, variable.value);
            core.debug(`Exported ${variable.key}=${variable.value} as ENV var`);
        }
        catch (error) {
            const message = `Cannot retrieve variable ${variable.key}`;
            if (failIfNotFound) {
                core.setFailed(message);
            }
            else {
                core.warning(message);
            }
        }
    }
});
const manageArtifacts = (variables, delimiter, failIfNotFound) => __awaiter(void 0, void 0, void 0, function* () {
    const variablesDetail = [];
    for (const variable of variables.split(new RegExp(delimiter))) {
        try {
            variablesDetail.push(defineVariableOperation(variable));
        }
        catch (error) {
            console.log(error);
        }
    }
    const artifactToStore = variablesDetail
        .filter((variable) => variable.operationToProceed === 0)
        .map((variable) => variable.detail);
    core.debug(`Artifact to store: ${JSON.stringify(artifactToStore)}`);
    yield storeArtifact(artifactToStore, failIfNotFound);
    const artifactToRetrieve = variablesDetail
        .filter((variable) => variable.operationToProceed === 1)
        .map((variable) => variable.detail);
    core.debug(`Artifact to retrieve: ${JSON.stringify(artifactToStore)}`);
    yield retrieveArtifact(artifactToRetrieve, failIfNotFound);
    const result = variablesDetail.reduce((variablesObject, variableToExport) => (Object.assign(Object.assign({}, variablesObject), { [variableToExport.detail.key]: variableToExport.detail.value })), {});
    core.debug(`result: ${JSON.stringify(result)}`);
});
exports.default = manageArtifacts;
