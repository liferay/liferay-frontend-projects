#!/usr/bin/env node
/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const clone = require('clone');
const fs = require('fs');
const path = require('path');
const readJsonSync = require('read-json-sync');

const {safeRunFs, yarn} = require('./util');

// Read package.json
const pkgJson = readJsonSync(path.join('.', 'package.json'));

let deps;

// Grab dependencies from package.json
deps = [
	...Object.keys(pkgJson.dependencies),
	...Object.keys(pkgJson.devDependencies),
].filter(dep => dep.startsWith('liferay-npm'));

// Grab dependencies from node_modules
try {
	fs.mkdirSync('node_modules');
} catch (err) {}

const dirs = fs
	.readdirSync('node_modules')
	.filter(dir => dir.startsWith('liferay-npm'));

deps.push(...dirs);

// Deduplicate dependencies
deps = Array.from(new Set(deps));

// Install all but JS toolkit dependencies
const modPkgJson = clone(pkgJson);

deps.forEach(dep => {
	delete modPkgJson.dependencies[dep];
	delete modPkgJson.devDependencies[dep];
});

fs.writeFileSync('package.json', JSON.stringify(modPkgJson, null, 2));

console.log('\n--- Installing dependencies not from JS Toolkit\n');
try {
	yarn('install');
} finally {
	fs.writeFileSync('package.json', JSON.stringify(pkgJson, null, 2));
}

// Link dependencies with yarn
console.log('\n--- Linking dependencies from JS Toolkit\n');
deps.forEach(dep => {
	yarn('link', dep);
});

// Link binaries by hand (yarn doesn't do it)
console.log('\n--- Linking binaries from JS Toolkit\n');
deps.forEach(dep => {
	const depPkgJson = readJsonSync(
		path.join('.', 'node_modules', dep, 'package.json')
	);

	const bins = depPkgJson.bin || {};

	Object.entries(bins).forEach(([bin, script]) => {
		const scriptPath = path.join('..', dep, script);
		const binPath = path.join('.', 'node_modules', '.bin', bin);

		console.log('symlink', scriptPath, '->', binPath);

		safeRunFs(() => fs.mkdirSync(path.join('.', 'node_modules', '.bin')));

		try {
			fs.symlinkSync(scriptPath, binPath);
		} catch (err) {
			if (err.code !== 'EEXIST') {
				throw err;
			}
		}
	});
});
