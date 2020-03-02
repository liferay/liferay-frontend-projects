/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const chalk = require('chalk');
const execa = require('execa');
const globby = require('globby');
const path = require('path');
const readJsonSync = require('read-json-sync');

// Note that this script may be substituted by:
//
//    yarn workspaces run build
//
// But I'm keeping it in case we need to tweak the order of the build because
// of mutual dependencies.
//
// Also, this script runs multiple builds in parallel while yarn serializes
// them which makes the build much slower.

const projectGroups = [
	['liferay-npm-build-tools-common'],
	[
		'generator-liferay-js',
		'liferay-npm-bridge-generator',
		'liferay-npm-build-support',
		'liferay-npm-bundler',
		'liferay-npm-bundler-loader-babel-loader',
		'liferay-npm-bundler-loader-copy-loader',
		'liferay-npm-bundler-loader-css-loader',
		'liferay-npm-bundler-loader-json-loader',
		'liferay-npm-bundler-loader-sass-loader',
		'liferay-npm-bundler-loader-style-loader',
		'liferay-npm-bundler-preset-angular-cli',
		'liferay-npm-bundler-preset-create-react-app',
		'liferay-npm-bundler-preset-standard',
		'liferay-npm-bundler-preset-vue-cli',
		'liferay-npm-imports-checker',
	],
];

sanityCheck(projectGroups);
buildGroups(projectGroups);

function sanityCheck(projectGroups) {
	const projectNames = [].concat(...projectGroups);

	const dirNames = globby
		.sync(['packages/*/package.json'])
		.map(pkgJsonPath => path.basename(path.dirname(pkgJsonPath)));

	const missingProjectNames = dirNames.filter(
		dirName => projectNames.indexOf(dirName) == -1
	);

	if (missingProjectNames.length > 0) {
		console.log(
			chalk.red(
				'The following projects are missing in the scripts/build.js script:' +
					'\n\n' +
					missingProjectNames.map(line => `  · ${line}`).join('\n') +
					'\n\n' +
					'If you have added a new project, place it in the correct project group.\n'
			)
		);
		process.exit(1);
	}
}

async function buildGroups(projectGroups) {
	for (const projectNames of projectGroups) {
		const success = await buildProjects(projectNames);

		if (!success) {
			console.log(chalk.red('BUILD FAILED 😥'));
			process.exit(1);
		}
	}

	console.log(chalk.green('BUILD FINISHED 🙂'));
}

function buildProjects(projectNames) {
	const promises = [];
	let success = true;

	projectNames.forEach(projectName => {
		const pkgJsonPath = path.join(
			'.',
			'packages',
			projectName,
			'package.json'
		);
		const pkgJson = readJsonSync(pkgJsonPath);

		if (!pkgJson.scripts || !pkgJson.scripts.build) {
			return;
		}

		const prjDir = path.dirname(pkgJsonPath);
		const prjName = path.basename(prjDir);

		promises.push(
			execa('yarn', ['build'], {
				cwd: prjDir,
			})
				.then(({stdout}) => {
					console.log(chalk.gray('>>> build'), chalk.green(prjName));
					console.log(stdout);
					console.log('');
				})
				.catch(err => {
					console.log(chalk.gray('>>> build'), chalk.red(prjName));
					console.log(err.toString());
					console.log('');

					success = false;
				})
		);
	});

	return Promise.all(promises).then(() => success);
}
