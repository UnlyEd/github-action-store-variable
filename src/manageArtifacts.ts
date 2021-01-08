/**
 * Receive and manage variables
 * Options:
 *  0: Set value "value" to variable "key"
 *  1: Retrieve value from variable "key"
 */
import {join} from 'path';
import {readFileSync, mkdirSync, writeFileSync} from 'fs';
import * as core from '@actions/core';
import {VariableDetail, VariableStatus} from "./types/variableStatus";
import {WORKDIR} from "./config";
import rimraf from "rimraf";
import {ArtifactClient, UploadOptions} from "@actions/artifact";
import {UploadResponse} from "@actions/artifact/lib/internal/upload-response";

const artifact = require('@actions/artifact');
const io = require('@actions/io');

const defineVariableOperation = (variable: string): VariableStatus => {
    try {
        const variableContent: VariableDetail = {
            key: variable.split("=")[0],
            value: variable.split("=")[1]
        };
        if (typeof variableContent.key !== 'undefined' && typeof variableContent.value !== 'undefined') {
            return {
                operationToProceed: 0,
                detail: variableContent
            }
        } else if (typeof variableContent.key !== undefined) {
            return {
                operationToProceed: 1,
                detail: variableContent
            }
        } else {
            throw Error(`Both key and value are empty`)
        }
    } catch (error) {
        throw Error('Error type')
    }
}

const storeArtifact = async (variables: VariableDetail[]): Promise<void> => {
    const client: ArtifactClient = artifact.create();
    const artifactOptions: UploadOptions = {
        retentionDays: 1 // Only keep artifacts 1 day to avoid reach limit: https://github.com/actions/toolkit/blob/c861dd8859fe5294289fcada363ce9bc71e9d260/packages/artifact/src/internal/upload-options.ts#L1
    }
    const artifactsUploadPromises: Promise<UploadResponse>[] = [];

    rimraf.sync(WORKDIR);
    mkdirSync(WORKDIR);

    for (const variable of variables) {
        const file: string = join(WORKDIR, `${variable.key}.txt`);

        writeFileSync(file, variable.value, {encoding: 'utf8'});
        artifactsUploadPromises.push(client.uploadArtifact(variable.key, [file], process.cwd(), artifactOptions));
    }
    const uploadResponses = await Promise.all(artifactsUploadPromises);
    console.log(uploadResponses);
}

const retrieveArtifact = async (variables: VariableDetail[]): Promise<void> => {
    const client: ArtifactClient = artifact.create();

    rimraf.sync(WORKDIR);
    mkdirSync(WORKDIR);
    for (const variable of variables) {
        try {
            const file = join(WORKDIR, `${variable.key}.txt`);
            await client.downloadArtifact(variable.key);
            variable.value = readFileSync(file, {encoding: 'utf8'}).toString();
        } catch (error) {
            core.warning(`Cannot retrieve variable ${variable.key}`)
            console.error(error);
        }
    }
}

const manageArtifacts = async (variables: string, delimiter: string): Promise<void> => {
    const variablesDetail: VariableStatus[] = [];

    for (const variable of variables.split(/\r?\n/)) {
        console.log("Debugging received line: ", variable);
        try {
            variablesDetail.push(defineVariableOperation(variable));
        } catch (error) {
            console.log(error)
        }
    }
    console.log("Before:")
    console.log(variablesDetail)
    await storeArtifact(variablesDetail.filter((variable: VariableStatus) => variable.operationToProceed === 0)
        .map((variable: VariableStatus) => variable.detail));
    await retrieveArtifact(variablesDetail.filter((variable: VariableStatus) => variable.operationToProceed === 1)
        .map((variable: VariableStatus) => variable.detail));
    console.log("After:")
    console.log(variablesDetail)

    const variablesResult = variablesDetail.reduce((variablesObject, variableToExport) => ({...variablesObject, [variableToExport.detail.key]: variableToExport.detail.value}), {});
    core.info(`variables contains: ${variablesResult}`);
    core.setOutput("variables", variablesResult);
}

export default manageArtifacts;