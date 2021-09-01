/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const {createInterface} = require('readline');

const git = require('./git');
const run = require('./run');

/**
 * Intended to be run as a "postversion" script to publish the new version
 * whenever we update a package version by (effectively) running:
 *
 *     git push $REMOTE master &&
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
	let exitStatus = 0;

	try {
		const branch = git('rev-parse', '--abbrev-ref', 'HEAD');

		if (branch !== 'master') {
			panic('Not on "master" branch');
		}

		checkCleanWorktree();

		await checkYarnRc();

		const pkg = JSON.parse(fs.readFileSync('package.json').toString());

		await checkPackage(pkg);

		const remote = getRemote();

		await confirm(`Push to ${remote}/master?`);

		git('push', remote, 'master', '--follow-tags');

		await runYarnPublish(pkg);

		const url = `https://www.npmjs.com/package/${pkg.name}`;

		printBanner(
			'Done! ✅',
			'You can sanity-check that the package is correctly listed here:',
			url
		);
	}
	catch (error) {
		printBanner(
			'Failed to automatically publish package! ❌',
			error.message,
			'Please try publishing manually.',
			'For reference, these are the publishing steps:',
			'git rev-parse --abbrev-ref HEAD # expect "master"\n' +
				'git diff --quiet # expect no output\n' +
				'git push $REMOTE master --follow-tags # you will need to supply $REMOTE\n' +
				'yarn publish'
		);

		exitStatus = 1;
	}
	finally {
		if (readline) {
			readline.close();
		}

		process.exit(exitStatus);
	}
}

function panic(reason) {
	throw new Error(`${reason}: too scared to continue 😱`);
}

function checkCleanWorktree() {
	try {
		git('diff', '--quiet');
	}
	catch (_error) {
		panic('Worktree is not clean');
	}
}

async function checkPackage(pkg) {
	if (!pkg.scripts || !pkg.scripts.preversion) {
		await confirm('No "preversion" script was found; proceed anyway?');
	}

	if (
		!pkg.scripts ||
		!pkg.scripts.postversion ||
		!pkg.scripts.postversion.match(/\bpublish\b/)
	) {
		await confirm('No "postversion" script was found; proceed anyway?');
	}
}

async function checkYarnRc() {
	if (!fs.existsSync('.yarnrc')) {
		await confirm('No .yarnrc file was found; proceed anyway?');
	}
}

const YES_REGEX = /^\s*y(es?)?\s*/i;

function confirm(prompt, answer = 'y', matcher = YES_REGEX) {
	if (!readline) {
		readline = createInterface({
			input: process.stdin,
			output: process.stdout,
		});
	}

	const promise = new Promise((resolve) => {
		const question = answer === 'y' ? `${prompt} [y/n] ` : `${prompt} `;
		readline.question(question, resolve);
	}).then((result) => {
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

const UPSTREAM_REPO_REGEX = /\bgithub\.com[/:]liferay\/[a-z-]+(?:\.git)?/i;

function getRemote() {
	const remotes = git('remote', '-v').split('\n');

	const upstreams = remotes
		.map((remote) => {
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
			}
			else if (a[1] < b[1]) {
				return -1;
			}
			else {
				return 0;
			}
		});

	const remote = upstreams[0];

	if (remote) {
		return remote[0];
	}

	throw new Error('Unable to determine remote repository URL');
}

function isPrereleaseVersion(pkg) {
	const {version} = pkg;

	return version.includes('-');
}

function print(...things) {
	// eslint-disable-next-line no-console
	console.log(...things);
}

function printBanner(...lines) {
	print(['', ...lines, ''].join('\n\n'));
}

async function runYarnPublish(pkg) {
	await confirm('Run `yarn publish`?');

	const args = ['--non-interactive'];

	const otp = await confirm(
		'Please enter an OTP token (https://git.io/JmaXU) or press ENTER:',
		''
	);

	if (otp) {
		args.push('--otp', otp);
	}
	else {
		printBanner(
			'Proceeding without 2FA (Two-Factor Autentication) ☠️ ',
			'2FA is strongly recommended, to keep our packages secure.',
			'Please consider activating it.',
			'See https://git.io/JmaXU to learn more'
		);
	}

	if (isPrereleaseVersion(pkg)) {
		args.push('--tag', 'prerelease');
	}

	try {
		run('yarn', 'publish', ...args);
	}
	catch (error) {
		printBanner(
			'Failed to publish package! ❌',
			'',
			`You've already pushed to remote.`,
			`Try publishing with 'yarn publish ${args.join(' ')}'`
		);
	}
}

module.exports = {
	isPrereleaseVersion,
	main,
};
