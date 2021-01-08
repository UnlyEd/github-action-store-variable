export type VariableStatus = {
    operationToProceed: number,
    detail: VariableDetail
}

export type VariableDetail = {
    key: string,
    value: string
}