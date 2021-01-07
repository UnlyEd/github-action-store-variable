"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const manageArtifacts = (variables, delimiter) => {
    const variablesDetail = [];
    for (const variable of variables.split(delimiter)) {
        try {
            variablesDetail.push(defineVariableOperation(variable));
        }
        catch (error) {
            console.log(error);
        }
    }
    console.log(variablesDetail);
};
exports.default = manageArtifacts;
