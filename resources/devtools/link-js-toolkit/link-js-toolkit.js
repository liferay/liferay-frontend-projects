#!/usr/bin/env node
/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const path = require('path');
const readJsonSync = require('read-json-sync');

const {safeRunFs, yarn} = require('./util');

// Read package.json
const pkgJson = readJsonSync(path.join('.', 'package.json'));

// Grab dependencies
const deps = []
	.concat(Object.keys(pkgJson.dependencies))
	.concat(Object.keys(pkgJson.devDependencies))
	.filter(dep => dep.startsWith('liferay-npm'));

// Link dependencies with yarn
deps.forEach(dep => {
	yarn('link', dep);
});

// Link binaries by hand (yarn doesn't do it)
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
