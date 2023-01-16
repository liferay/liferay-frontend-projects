/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getUserConfig = require('./getUserConfig');

function collectDefinedDependencies() {
	const rootConfig = getUserConfig('npmscripts');

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
