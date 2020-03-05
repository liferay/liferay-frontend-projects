/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs-extra');
const path = require('path');

const {git, yarn} = require('./util/run');
const {abort, success} = require('./util/report');

const EXPECTED_PREPUBLISH = 'node ../../scripts/disable-publish.js';
const PKG_JSON = fs.readJSONSync('package.json');
const RELEASE_BRANCH = ['3.x-WIP'];
const WORKSPACE_DIR = path.resolve(path.join(__dirname, '..'));

async function main() {
	const status = await git('status', '--porcelain');

	if (status !== '') {
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
		await yarn.pipe(
			'ci',
			{cwd: WORKSPACE_DIR}
		);
	} catch (err) {
		console.error(err.message);
		throw `CI checks failed: please fix and try again`;
	}

	success('CI tests passed');

	const pkgJson = {
		...PKG_JSON,
		version: `${PKG_JSON.version}-snapshot.${commitHash}`,
	};

	if (pkgJson.scripts.prepublish !== EXPECTED_PREPUBLISH) {
		throw `Prepublish script incorrectly configured: please set it to '${EXPECTED_PREPUBLISH}'`;
	}

	delete pkgJson.scripts.prepublish;

	fs.writeFileSync('package.json', JSON.stringify(pkgJson, null, '\t'));

	await yarn.pipe(
		'publish',
		'--tag',
		'snapshot',
		'--non-interactive'
	);

	success(
		`Published version ${pkgJson.version} to https://www.npmjs.com/package/${pkgJson.name}`
	);
}

main()
	.then(() => git('checkout', 'package.json'))
	.catch(err =>
		git('checkout', 'package.json').then(() => {
			if (typeof err === 'string') {
				abort(err);
			} else {
				console.error(err);
				process.exit(1);
			}
		})
	);
