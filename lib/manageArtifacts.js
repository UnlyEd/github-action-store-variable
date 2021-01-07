"use strict";
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
const path_1 = require("path");
const fs_1 = require("fs");
const rimraf_1 = __importDefault(require("rimraf"));
const config_1 = require("./config");
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
    const artifact = require('@actions/artifact');
    const client = artifact.create();
    const artifactOptions = {
        retentionDays: 1 // Only keep artifacts 1 day to avoid reach limit: https://github.com/actions/toolkit/blob/c861dd8859fe5294289fcada363ce9bc71e9d260/packages/artifact/src/internal/upload-options.ts#L1
    };
    const artifactsUploadPromises = [];
    console.log(variables);
    for (const variable of variables) {
        const file = path_1.join(config_1.WORKDIR, `${variable.key}.txt`);
        // cleanup old directories if needed
        rimraf_1.default.sync(config_1.WORKDIR);
        fs_1.mkdirSync(config_1.WORKDIR);
        fs_1.writeFileSync(file, variable.value, { encoding: 'utf8' });
        artifactsUploadPromises.push(client.uploadArtifact(variable.value, [file], process.cwd(), artifactOptions));
    }
    const uploadResponses = yield Promise.all(artifactsUploadPromises);
    console.log(uploadResponses);
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
    yield storeArtifact(variablesDetail.filter((variable) => variable.operationToProceed === 0)
        .map((variable) => variable.variableDetail));
});
exports.default = manageArtifacts;
