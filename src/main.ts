import * as core from '@actions/core';
import manageArtifacts from './manageArtifacts';

/**
 * Runs the GitHub Action.
 */
const run = async (): Promise<void> => {
  if (!core.isDebug()) {
    core.info('Debug mode is disabled. Read more at https://github.com/UnlyEd/github-action-store-variable#how-to-enable-debug-logs');
  }

  try {
    const variables: string = core.getInput('variables');
    const delimiter: string = core.getInput('delimiter');
    const failIfNotFound: boolean = core.getInput('failIfNotFound') == 'true';
    core.debug(`Received variables: ${variables}`); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true https://github.com/actions/toolkit/blob/master/docs/action-debugging.md#how-to-access-step-debug-logs
    core.debug(`Using delimiter: "${delimiter}"`);
    core.debug(`Using failIfNotFound: "${failIfNotFound}"`);

    await manageArtifacts(variables, delimiter, failIfNotFound);
  } catch (error) {
    core.setFailed(error.message);
  }
};

//runConfigChecks();
run()
  .then((actionReturn) => {})
  .catch((error) => {
    core.setFailed(error);
  });
