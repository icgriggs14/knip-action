const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

async function run() {
  try {
    const threshold = parseInt(core.getInput('threshold') || '0', 10);
    const failOnError = core.getInput('fail_on_error') !== 'false';
    const reporter = core.getInput('reporter') || 'compact';
    const token = core.getInput('github_token');
    const workingDir = core.getInput('working_directory') || '.';

    core.info(`knip-action: running knip in ${workingDir} (reporter=${reporter}, threshold=${threshold})`);

    let output = '';
    let errOutput = '';

    const options = {
      cwd: workingDir,
      ignoreReturnCode: true,
      listeners: {
        stdout: (data) => { output += data.toString(); },
        stderr: (data) => { errOutput += data.toString(); },
      },
    };

    // Install knip if not present
    await exec.exec('npx', ['--yes', 'knip', '--version'], { ignoreReturnCode: true, silent: true });

    const exitCode = await exec.exec(
      'npx',
      ['knip', `--reporter=${reporter}`],
      options
    );

    const combined = output + errOutput;
    const lines = combined.split('\n').filter(l => l.trim());

    // Count issue lines (non-empty, non-header lines that look like findings)
    const issueLines = lines.filter(l =>
      !l.startsWith('knip') &&
      !l.startsWith('Unused') &&
      l.trim().length > 0 &&
      (l.includes('unused') || l.includes('Unused') || exitCode !== 0)
    );

    // Conservative count: use exit code as primary signal
    const issueCount = exitCode !== 0 ? Math.max(issueLines.length, 1) : 0;
    core.setOutput('issue_count', issueCount.toString());

    const passed = issueCount <= threshold && (exitCode === 0 || !failOnError);
    core.setOutput('passed', passed.toString());

    core.info(`knip-action: exit=${exitCode}, issues=${issueCount}, threshold=${threshold}, passed=${passed}`);

    // Post PR comment if running in a PR context
    if (token && github.context.payload.pull_request) {
      try {
        const octokit = github.getOctokit(token);
        const { owner, repo } = github.context.repo;
        const prNumber = github.context.payload.pull_request.number;

        const statusEmoji = passed ? '✅' : '❌';
        const statusText = passed ? 'PASSED' : 'FAILED';
        const thresholdNote = threshold === 0 ? 'any issue fails CI' : `threshold: ${threshold}`;

        let body = `## ${statusEmoji} knip — ${statusText}\n\n`;
        body += `| Metric | Value |\n|--------|-------|\n`;
        body += `| Issues found | ${issueCount} |\n`;
        body += `| Threshold | ${threshold} (${thresholdNote}) |\n`;
        body += `| Exit code | ${exitCode} |\n\n`;

        if (issueCount > 0 && lines.length > 0) {
          const preview = lines.slice(0, 20).join('\n');
          body += `<details><summary>knip output</summary>\n\n\`\`\`\n${preview}\n`;
          if (lines.length > 20) body += `\n... (${lines.length - 20} more lines)\n`;
          body += '```\n</details>\n\n';
        }

        body += `---\n*Powered by [knip-action](https://github.com/icgriggs14/knip-action) — `;
        body += `[knip](https://github.com/webpro-nl/knip) CI companion (7.97M weekly npm downloads)*\n`;
        body += `*Support this project: [GitHub Sponsors](https://github.com/sponsors/icgriggs14)*`;

        await octokit.rest.issues.createComment({ owner, repo, issue_number: prNumber, body });
        core.info('knip-action: PR comment posted');
      } catch (commentErr) {
        core.warning(`knip-action: failed to post PR comment: ${commentErr.message}`);
      }
    }

    if (!passed) {
      if (exitCode !== 0 && failOnError) {
        core.setFailed(`knip found ${issueCount} issue(s) — exceeds threshold of ${threshold}`);
      } else if (exitCode !== 0) {
        core.warning(`knip exited with code ${exitCode} but fail_on_error=false`);
      } else {
        core.setFailed(`knip found ${issueCount} issue(s) — exceeds threshold of ${threshold}`);
      }
    } else {
      core.info(`knip-action: clean! ${issueCount} issues found, within threshold of ${threshold}`);
    }
  } catch (err) {
    core.setFailed(`knip-action error: ${err.message}`);
  }
}

run();
