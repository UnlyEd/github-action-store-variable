/**
 * Receive and manage variables
 * Options:
 *  0: Set value "value" to variable "key"
 *  1: Retrieve value from variable "key"
 */
import {VariableDetail, VariableStatus} from "./types/variableStatus";

const defineVariableOperation = (variable: string): VariableStatus => {
    try {
        const variableContent: VariableDetail = {
            key: variable.split("=")[0],
            value: variable.split("=")[1]
        };
        if (typeof variableContent.key !== 'undefined' && typeof variableContent.value !== 'undefined') {
            return {
                operationToProceed: 0,
                variableDetail: variableContent
            }
        } else if (typeof variableContent.key !== undefined) {
            return {
                operationToProceed: 1,
                variableDetail: variableContent
            }
        } else {
            throw Error(`Both key and value are empty`)
        }
    } catch (error) {
        throw Error('Error type')
    }
}

const manageArtifacts = (variables: string, delimiter: string): void => {
    const variablesDetail: VariableStatus[] = [];
    for (const variable of variables.split(delimiter)) {
        try {
            variablesDetail.push(defineVariableOperation(variable));
        } catch (error) {
            console.log(error)
        }
    }
    console.log(variablesDetail);
}

export default manageArtifacts;