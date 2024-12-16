/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const spawn = require('cross-spawn');
const fs = require('fs-extra');
const path = require('path');
const readJsonSync = require('read-json-sync');

const toolkitProjectNames = fs.readdirSync(
	path.join(__dirname, '..', '..', '..', 'packages')
);

function isToolkitDep(pkgName) {
	return toolkitProjectNames.indexOf(pkgName) !== -1;
}

function modifyPackageJson(pkgJsonPath, callback) {
	const pkgJson = readJsonSync(pkgJsonPath);

	pkgJson.dependencies = pkgJson.dependencies || {};
	pkgJson.devDependencies = pkgJson.devDependencies || {};

	callback(pkgJson);

	fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, '	'));
}

function yarn(...args) {
	const proc = spawn.sync('yarn', args, {
		shell: true,
		stdio: 'inherit',
	});

	if (proc.error) {
		throw proc.error;
	}
	else if (proc.status !== 0) {
		throw new Error(
			`'yarn ${args.join(' ')}' finished with status ${proc.status}`
		);
	}
	else if (proc.signal) {
		throw new Error(
			`'yarn ${args.join(' ')}' finished due to signal ${proc.signal}`
		);
	}
}

function yarnLink(deps) {

	// Link dependencies with yarn

	deps.forEach((dep) => {
		yarn('link', dep);
	});

	// Link binaries by hand (yarn doesn't do it)

	deps.forEach((dep) => {
		const depPkgJson = readJsonSync(
			path.join('.', 'node_modules', dep, 'package.json')
		);

		const bins = depPkgJson.bin || {};

		Object.entries(bins).forEach(([bin, script]) => {
			const scriptPath = path.join('..', dep, script);
			const binPath = path.join('.', 'node_modules', '.bin', bin);

			console.log('symlink', scriptPath, '->', binPath);
			fs.ensureSymlinkSync(scriptPath, binPath);
		});
	});
}

module.exports = {
	isToolkitDep,
	modifyPackageJson,
	toolkitProjectNames,
	yarn,
	yarnLink,
};
