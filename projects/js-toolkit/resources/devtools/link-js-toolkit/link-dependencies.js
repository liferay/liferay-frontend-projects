/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const clone = require('clone');
const fs = require('fs');
const path = require('path');
const readJsonSync = require('read-json-sync');

const {isToolkitDep, yarn, yarnLink} = require('./util');

function linkDependencies(extraDependencies = []) {

	// Read package.json

	const pkgJson = readJsonSync(path.join('.', 'package.json'));

	pkgJson.dependencies = pkgJson.dependencies || {};
	pkgJson.devDependencies = pkgJson.devDependencies || {};

	let deps;

	// Grab dependencies from package.json

	deps = [
		...Object.keys(pkgJson.dependencies),
		...Object.keys(pkgJson.devDependencies),
	].filter(isToolkitDep);

	// Grab dependencies from node_modules

	try {
		fs.mkdirSync('node_modules');
	}
	catch (error) {

		// ignore

	}

	const dirs = fs.readdirSync('node_modules').filter(isToolkitDep);

	deps.push(...dirs);

	// Deduplicate dependencies

	deps = Array.from(new Set(deps));

	// Install all but JS toolkit dependencies

	const modPkgJson = clone(pkgJson);

	deps.forEach((dep) => {
		delete modPkgJson.dependencies[dep];
		delete modPkgJson.devDependencies[dep];
	});

	fs.writeFileSync('package.json', JSON.stringify(modPkgJson, null, 2));

	console.log('\n--- Installing dependencies not from JS Toolkit\n');
	try {
		extraDependencies.forEach((extraDep) => {
			yarn('add', extraDep);

			const newPkgJson = readJsonSync(path.join('.', 'package.json'));

			pkgJson.dependencies[extraDep] = newPkgJson.dependencies[extraDep];
		});

		yarn('install');
	}
	finally {
		fs.writeFileSync('package.json', JSON.stringify(pkgJson, null, 2));
	}

	// Link dependencies with yarn

	console.log('\n--- Linking dependencies from JS Toolkit\n');
	yarnLink(deps);
}

module.exports = linkDependencies;
