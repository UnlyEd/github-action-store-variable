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
const core = __importStar(require("@actions/core"));
const manageArtifacts_1 = __importDefault(require("./manageArtifacts"));
/**
 * Runs the GitHub Action.
 */
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!core.isDebug()) {
        core.info('Debug mode is disabled. Read more at https://github.com/UnlyEd/github-action-store-variable#how-to-enable-debug-logs');
    }
    try {
        const variables = core.getInput('variables');
        const delimiter = core.getInput('delimiter');
        const failIfNotFound = core.getInput('failIfNotFound') == 'true';
        core.debug(`Received variables: ${variables}`); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true https://github.com/actions/toolkit/blob/master/docs/action-debugging.md#how-to-access-step-debug-logs
        core.debug(`Using delimiter: "${delimiter}"`);
        core.debug(`Using failIfNotFound: "${failIfNotFound}"`);
        yield (0, manageArtifacts_1.default)(variables, delimiter, failIfNotFound);
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
//runConfigChecks();
run()
    .then((actionReturn) => { })
    .catch((error) => {
    core.setFailed(error);
});
