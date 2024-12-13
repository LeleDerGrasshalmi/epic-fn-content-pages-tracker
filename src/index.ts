import { execSync } from 'child_process';
import fs from 'fs';
import fsp, { writeFile } from 'fs/promises';

import env from './utils/env.js';
import getContentPagesKey from './utils/get-content-pages-key.js';

const outputFolder = 'output';

const deployments = [
  'prod07',
  'rp',
  'nscert',
];

const keys = [
  'fortnite-game',
  'fortnite-editor',
];

const main = async () => {
  // clean up old data
  if (fs.existsSync(outputFolder)) {
    await fsp.rmdir(outputFolder, { recursive: true });
  }

  for (let i = 0; i < deployments.length; i += 1) {
    const deployment = deployments[i];
    const deploymentFolder = `${outputFolder}/${deployment}`;

    try {
      for (let j = 0; j < keys.length; j += 1) {
        const key = keys[j];
        const keyFolder = `${deploymentFolder}/${key}`;

        await fsp.mkdir(keyFolder, { recursive: true });

        try {
          const keyResponse = await getContentPagesKey(deployment, key);

          if (keyResponse.status === 404) {
            console.error(`[${deployment}] [${key}] key does not exist`);

            continue;
          }

          if (!keyResponse.success) {
            continue;
          }

          await writeFile(`${deploymentFolder}/${key}.json`, JSON.stringify(keyResponse.data, null, 3));

          const objValues = Object.values(keyResponse.data);

          for (let k = 0; k < objValues.length; k += 1) {
            const value = objValues[k];

            if (!value || typeof value !== 'object' || !('_title' in value) || typeof value._title !== 'string') {
              continue;
            }

            // need to normalize the key first
            const subKey = value._title.replace(/ /g, '-').toLowerCase();
            const fullSubKey = `${key}/${subKey}`;

            try {
              const subResponse = await getContentPagesKey(deployment, fullSubKey);

              if (subResponse.status === 404) {
                console.error(`[${deployment}] [${fullSubKey}] key does not exist`);

                continue;
              }

              if (!subResponse.status) {
                continue;
              }

              await writeFile(`${keyFolder}/${subKey}.json`, JSON.stringify(subResponse.data, null, 3));
            } catch (err) {
              console.error(`[${deployment}] [${fullSubKey}] failed updating key data`, err);
            }
          }
        } catch (err) {
          console.error(`[${deployment}] [${key}] failed updating key data`, err);
        }
      }

      const gitStatus = execSync(`git status ${deploymentFolder}`)?.toString('utf-8') || '';
      const isModified = gitStatus.includes(outputFolder);

      if (!isModified) {
        continue;
      }

      const commitMessage = `Modified ${deployment}`;

      console.info(`[${deployment}] ${commitMessage}`);

      if (env.GIT_DO_NOT_COMMIT?.toLowerCase() === 'true') {
        continue;
      }

      execSync(`git add ${deploymentFolder}`);
      execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
      execSync('git config user.name "github-actions[bot]"');
      execSync('git config commit.gpgsign false');
      execSync(`git commit -m "${commitMessage}"`);
    } catch (err) {
      console.error(`[${deployment}] unknown error`, err);
    }
  }

  if (env.GIT_DO_NOT_PUSH?.toLowerCase() === 'true') {
    return;
  }

  execSync('git push');
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
