/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const findRoot = require('./findRoot');

function collectDefinedDependencies() {
	const rootDir = findRoot();

	let rootConfig = {};

	if (!rootDir) {
		return new Set();
	}

	try {
		/* eslint-disable-next-line @liferay/no-dynamic-require */
		rootConfig = require(path.join(rootDir, 'npmscripts.config'));
	}
	catch (error) {
		return new Set();
	}

	const amdImports = new Set(
		Object.entries(rootConfig.build.bundler.config.imports).reduce(
			(acc, [moduleName, imports]) => {
				return [...acc, moduleName, ...Object.keys(imports)];
			},
			[]
		)
	);

	const esmImports = new Set(
		Object.entries(rootConfig.build.imports).reduce(
			(acc, [moduleName, dependencies]) => {
				return [...acc, moduleName, ...dependencies];
			},
			[]
		)
	);

	const excludedDeps = new Set(
		Object.entries(rootConfig.build.bundler.exclude).reduce(
			(acc, [dependency, val]) => {
				if (val) {
					return [...acc, dependency];
				}

				return acc;
			},
			[]
		)
	);

	return new Set([...amdImports, ...esmImports, ...excludedDeps]);
}

module.exports = collectDefinedDependencies;
