"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoFileOptions = exports.Inputs = void 0;
/* eslint-disable no-unused-vars */
var Inputs;
(function (Inputs) {
    Inputs["Name"] = "name";
    Inputs["Path"] = "path";
    Inputs["IfNoFilesFound"] = "if-no-files-found";
    Inputs["RetentionDays"] = "retention-days";
    Inputs["CompressionLevel"] = "compression-level";
    Inputs["Overwrite"] = "overwrite";
    Inputs["IncludeHiddenFiles"] = "include-hidden-files";
})(Inputs = exports.Inputs || (exports.Inputs = {}));
var NoFileOptions;
(function (NoFileOptions) {
    /**
     * Default. Output a warning but do not fail the action
     */
    NoFileOptions["warn"] = "warn";
    /**
     * Fail the action with an error message
     */
    NoFileOptions["error"] = "error";
    /**
     * Do not output any warnings or errors, the action does not fail
     */
    NoFileOptions["ignore"] = "ignore";
})(NoFileOptions = exports.NoFileOptions || (exports.NoFileOptions = {}));
