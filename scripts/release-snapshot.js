/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');
const readlineSync = require('readline-sync');

const {abort, success, warn} = require('./util/report');
const {git, yarn} = require('./util/run');

const RAW_PKG_JSON = fs.readFileSync('package.json');
const PKG_JSON = JSON.parse(RAW_PKG_JSON);
const RELEASE_BRANCH = ['master'];
const WORKSPACE_DIR = path.resolve(path.join(__dirname, '..'));

async function isStatusClean(status) {
	if (status === '') {
		return true;
	}

	const lines = status.split('\n');

	if (lines.length > 1) {
		return false;
	}

	if (lines[0] !== ` M packages/${PKG_JSON.name}/package.json`) {
		return false;
	}

	console.log('');
	warn('File package.json is modified');

	console.log('');
	await git.pipe('diff', 'package.json');
	console.log('');

	const answer = readlineSync.question('Do you want to continue (y/N)? ');

	if (answer !== 'y') {
		return false;
	}

	return true;
}

async function main() {
	const status = await git('status', '--porcelain');

	if (!(await isStatusClean(status))) {
		throw 'Working copy has local changes';
	}

	success('Working copy is clean');

	const branch = await git('rev-parse', '--abbrev-ref', 'HEAD');

	if (branch != RELEASE_BRANCH) {
		throw `Only releases from branch ${RELEASE_BRANCH} allowed`;
	}

	success('Branch name is OK');

	try {
		await git('pull', '--ff-only', 'upstream', branch);
	} catch (err) {
		console.error(err.message);
		throw `Cannot FF pull from upstream/${branch}: please check your local branch status`;
	}

	success(`Branch upstream/${branch} pulled correctly`);

	const commitHash = await git('rev-parse', '--short', 'HEAD');
	const upstreamHash = await git(
		'rev-parse',
		'--short',
		`upstream/${branch}`
	);

	if (upstreamHash !== commitHash) {
		throw 'Local branch is ahead of upstream';
	}

	success('Upstream and local branches are in sync');

	try {
		await yarn.pipe('ci', {cwd: WORKSPACE_DIR});
	} catch (err) {
		console.error(err.message);
		throw `CI checks failed: please fix and try again`;
	}

	success('CI tests passed');

	const pkgJson = {
		...PKG_JSON,
		version: `${PKG_JSON.version}-snapshot.${commitHash}`,
	};

	await yarn.pipe('publish', '--tag', 'snapshot', '--non-interactive');

	success(
		`Published version ${pkgJson.version} to https://www.npmjs.com/package/${pkgJson.name}`
	);
}

main()
	.then(() => fs.writeFileSync('package.json', RAW_PKG_JSON))
	.catch(err => {
		fs.writeFileSync('package.json', RAW_PKG_JSON);

		if (typeof err === 'string') {
			abort(err);
		} else {
			console.error(err);
			process.exit(1);
		}
	});
