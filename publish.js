#!/usr/bin/env node

/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const {createInterface} = require('readline');

const git = require('./packages/liferay-npm-scripts/src/utils/git');
const log = require('./packages/liferay-npm-scripts/src/utils/log');
const run = require('./packages/liferay-npm-scripts/src/utils/run');

/**
 * Intended to be run as a "postversion" script to publish the new version
 * whenever we update a package version by (effectively) running:
 *
 *     git push $REMOTE master &&
 *     git checkout stable &&
 *     git merge --ff-only master &&
 *     git push $REMOTE stable --follow-tags &&
 *     yarn publish
 *
 * This is "safe" (enough) because:
 *
 * - We run `yarn ci` in the "preversion" script.
 * - In general, "master" should always be in a releasable (green) state due to
 *   our use of Travis CI.
 * - The script includes a number of checks and prompts for confirmation.
 */

let readline;

async function main() {
	const branch = git('rev-parse', '--abbrev-ref', 'HEAD');

	if (branch !== 'master') {
		panic('Not on "master" branch');
	}

	checkCleanWorktree();

	const remote = getRemote();

	await confirm(`Push to ${remote}/master?`);

	git('push', remote, 'master');

	await confirm('Merge "master" into "stable"?');

	git('checkout', 'stable');

	git('merge', '--ff-only', 'master');

	await confirm(`Push to ${remote}/stable?`);

	git('push', remote, 'stable', '--follow-tags');

	git('checkout', 'master');

	await confirm('Run `yarn publish`?');

	const otp = await confirm('Please enter an OTP token or press ENTER:', '');

	if (otp) {
		run('yarn', 'publish', '--non-interactive', '--otp', otp);
	} else {
		run('yarn', 'publish', '--non-interactive');
	}

	const packageName = JSON.parse(fs.readFileSync('package.json').toString())
		.name;

	const url = `https://www.npmjs.com/package/${packageName}`;

	printBanner(
		'Done! ✅',
		'You can sanity-check that the package is correctly listed here:',
		url
	);
}

function panic(reason) {
	throw new Error(`${reason}: too scared to continue 😱`);
}

function checkCleanWorktree() {
	try {
		git('diff', '--quiet');
	} catch (_error) {
		panic('Worktree is not clean');
	}
}

const YES_REGEX = /^\s*y(es?)?\s*/i;

function confirm(prompt, answer = 'y', matcher = YES_REGEX) {
	if (!readline) {
		readline = createInterface({
			input: process.stdin,
			output: process.stdout
		});
	}

	const promise = new Promise(resolve => {
		const question = answer === 'y' ? `${prompt} [y/n] ` : `${prompt} `;
		readline.question(question, resolve);
	}).then(result => {
		if (answer === 'y') {
			if (!result.match(matcher)) {
				throw new Error('User aborted');
			}
		}

		return result;
	});

	readline.write(answer);

	return promise;
}

const UPSTREAM_REPO_REGEX = /\bgithub\.com[/:]liferay\/liferay-npm-tools(?:\.git)?/i;

function getRemote() {
	const remotes = git('remote', '-v').split('\n');

	const upstreams = remotes
		.map(remote => {
			const [name, url] = remote.split(/\s+/);

			return [name, url];
		})
		.filter(([_name, url]) => {
			return UPSTREAM_REPO_REGEX.test(url);
		})
		.sort((a, b) => {
			// Sort by URL, preferring `git` over `http` URLs.
			if (a[1] > b[1]) {
				return 1;
			} else if (a[1] < b[1]) {
				return -1;
			} else {
				return 0;
			}
		});

	const remote = upstreams[0];

	if (remote) {
		return remote[0];
	}

	throw new Error('Unable to determine remote repository URL');
}

function printBanner(...lines) {
	log(['', ...lines, ''].join('\n\n'));
}

main()
	.catch(error => {
		printBanner(
			'Failed to automatically publish package due to:',
			error.message,
			'Please try publishing manually as per CONTRIBUTING.md.'
		);
	})
	.finally(() => {
		if (readline) {
			readline.close();
		}
	});
