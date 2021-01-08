"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const artifact = require('@actions/artifact');
const io = require('@actions/io');
const defineVariableOperation = (variable) => {
    try {
        const variableContent = {
            key: variable.split("=")[0],
            value: variable.split("=")[1]
        };
        if (typeof variableContent.key !== 'undefined' && typeof variableContent.value !== 'undefined') {
            return {
                operationToProceed: 0,
                variableDetail: variableContent
            };
        }
        else if (typeof variableContent.key !== undefined) {
            return {
                operationToProceed: 1,
                variableDetail: variableContent
            };
        }
        else {
            throw Error(`Both key and value are empty`);
        }
    }
    catch (error) {
        throw Error('Error type');
    }
};
const storeArtifact = (variables) => __awaiter(void 0, void 0, void 0, function* () {
    const client = artifact.create();
    const artifactOptions = {
        retentionDays: 1 // Only keep artifacts 1 day to avoid reach limit: https://github.com/actions/toolkit/blob/c861dd8859fe5294289fcada363ce9bc71e9d260/packages/artifact/src/internal/upload-options.ts#L1
    };
    const artifactsUploadPromises = [];
    rimraf_1.default.sync(config_1.WORKDIR);
    fs_1.mkdirSync(config_1.WORKDIR);
    for (const variable of variables) {
        const file = path_1.join(config_1.WORKDIR, `${variable.key}.txt`);
        fs_1.writeFileSync(file, variable.value, { encoding: 'utf8' });
        artifactsUploadPromises.push(client.uploadArtifact(variable.key, [file], process.cwd(), artifactOptions));
    }
    const uploadResponses = yield Promise.all(artifactsUploadPromises);
    console.log(uploadResponses);
});
const retrieveArtifact = (variables) => __awaiter(void 0, void 0, void 0, function* () {
    const client = artifact.create();
    for (const variable of variables) {
        try {
            rimraf_1.default.sync(config_1.WORKDIR);
            fs_1.mkdirSync(config_1.WORKDIR);
            const file = path_1.join(config_1.WORKDIR, `${variable.key}.txt`);
            yield client.downloadAllArtifacts(variable.key);
            variable.value = fs_1.readFileSync(file, { encoding: 'utf8' }).toString();
        }
        catch (error) {
            core.warning(`Cannot retrieve variable ${variable.key}`);
        }
    }
});
const manageArtifacts = (variables, delimiter) => __awaiter(void 0, void 0, void 0, function* () {
    const variablesDetail = [];
    for (const variable of variables.split(/\r?\n/)) {
        console.log("Debugging received line: ", variable);
        try {
            variablesDetail.push(defineVariableOperation(variable));
        }
        catch (error) {
            console.log(error);
        }
    }
    console.log("Before:");
    console.log(variablesDetail);
    yield storeArtifact(variablesDetail.filter((variable) => variable.operationToProceed === 0)
        .map((variable) => variable.variableDetail));
    yield retrieveArtifact(variablesDetail.filter((variable) => variable.operationToProceed === 1)
        .map((variable) => variable.variableDetail));
    console.log("After:");
    console.log(variablesDetail);
});
exports.default = manageArtifacts;
