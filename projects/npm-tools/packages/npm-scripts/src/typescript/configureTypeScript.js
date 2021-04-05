/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const BASE_CONFIG = require('../config/tsconfig-base.json');
const deepMerge = require('../utils/deepMerge');
const findRoot = require('../utils/findRoot');

const GENERATED = '@generated';
const OVERRIDES = '@overrides';
const TSCONFIG_JSON = 'tsconfig.json';

/**
 * Given a dependency graph (from `getTypeScriptDependencyGraph()`),
 * configures the `tsconfig.json` file in the current working directory
 * and writes it back to disk if changes are needed. Unlike some other
 * config files involved in our build process which can be generated on
 * the fly during the build, this file must be committed to the repo in
 * order for editors and IDEs to benefit from LSP integration.
 *
 * Returns `true` if the `tsconfig.json` file was already up-to-date, and
 * `false` otherwise.
 *
 * Note that up-to-date-ness is determined in a structural equality
 * sense (ie. are the values in the file the same) without regard
 * to formatting. This is so that we don't make things worse than
 * they already are in the conflict between Prettier and the Java
 * SourceFormatter (which generally disagree about how JSON should be
 * formatted).
 */
function configureTypeScript(graph) {
	if (!fs.existsSync('tsconfig.json')) {
		throw new Error(
			`configureTypeScript(): no tsconfig.json exists in ${process.cwd()}`
		);
	}

	const basename = path.basename(process.cwd());

	const project = graph[basename] || graph[`@liferay/${basename}`];

	if (!project) {
		throw new Error(
			`configureTypeScript(): project ${basename} not found in dependency graph`
		);
	}

	const root = findRoot();

	const contents = fs.readFileSync('tsconfig.json', 'utf8');

	const previousConfig = JSON.parse(contents.trim() ? contents : '{}');

	const paths = {};

	const references = [];

	for (const name of Object.keys(project.dependencies)) {
		const dependency = graph[name];

		// Note that "main" fields usually end with ".js" so that the loader can
		// find built files at runtime, but we actually care about source files
		// (which will have a ".ts" extension instead).

		const main = dependency.main.replace(/\.js$/, '.ts');

		paths[name] = [

			// TODO: don't hard-code "src/main/resources/META-INF/resources"
			// (we currently also hard-coded in `getJestModuleNameMapper()`)

			toPosix(
				path.relative(
					'',
					path.join(
						dependency.directory,
						'src',
						'main',
						'resources',
						'META-INF',
						'resources',
						main
					)
				)
			),
		];

		references.push({
			path: toPosix(path.relative('', dependency.directory)),
		});
	}

	const updatedConfig = deepMerge([
		{
			...BASE_CONFIG,
			compilerOptions: {
				...BASE_CONFIG.compilerOptions,
				paths: {
					...BASE_CONFIG.compilerOptions.paths,
					...paths,
				},
				typeRoots: [
					root &&
						toPosix(
							path.relative(
								'',
								path.join(root, 'node_modules', '@types')
							)
						),
					'./node_modules/@types',
				].filter(Boolean),
			},
			references: [...BASE_CONFIG.references, ...references],
		},
		previousConfig[OVERRIDES] || {},
	]);

	updatedConfig[GENERATED] = hash(updatedConfig);

	if (
		updatedConfig[GENERATED] !== previousConfig[GENERATED] ||
		updatedConfig[GENERATED] !== hash(previousConfig)
	) {
		fs.writeFileSync(TSCONFIG_JSON, format(updatedConfig), 'utf8');

		return false;
	}

	return true;
}

/**
 * Stringifies config as JSON in a manner pleasing to the Java SourceFormatter.
 */
function format(config) {
	return JSON.stringify(config, null, '\t');
}

function hash(config) {
	const shasum = crypto.createHash('sha1');

	shasum.update(
		JSON.stringify({
			...config,
			[GENERATED]: null,
		})
	);

	return shasum.digest('hex');
}

function toPosix(name) {
	return name.split(path.sep).join(path.posix.sep);
}

module.exports = configureTypeScript;
