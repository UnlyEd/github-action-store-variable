import * as core from '@actions/core';
import manageArtifacts from './manageArtifacts';

/**
 * Runs configuration checks to make sure everything is properly configured.
 * If anything isn't properly configured, will stop the workflow.
 */
const runConfigChecks = () => {
  if (!process.env.VERCEL_TOKEN) {
    const message =
      process.env.NODE_ENV === 'test'
        ? `VERCEL_TOKEN environment variable is not defined. Please define it in the ".env.test" file. See https://vercel.com/account/tokens`
        : `VERCEL_TOKEN environment variable is not defined. Please create a GitHub "VERCEL_TOKEN" secret. See https://vercel.com/account/tokens`;
    core.setFailed(message);
    throw new Error(message);
  }
};

/**
 * Runs the GitHub Action.
 */
const run = async (): Promise<void> => {
  if (!core.isDebug()) {
    core.info('Debug mode is disabled. Read more at https://github.com/UnlyEd/github-action-await-vercel#how-to-enable-debug-logs');
  }

  try {
    console.log(core.getState("foo"));
    core.saveState("foo", "bar");
    const variables: string = core.getInput('variables');
    const delimiter: string = core.getInput('delimiter');
    core.debug(`Received variables: ${variables}`); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true https://github.com/actions/toolkit/blob/master/docs/action-debugging.md#how-to-access-step-debug-logs
    core.debug(`Using delimiter: "${delimiter}"`);
    await manageArtifacts(variables, delimiter);
  } catch (error) {
    core.setFailed(error.message);
  }
};

//runConfigChecks();
run().then(actionReturn => {
}).catch(error => {
  core.setFailed(error);
});
