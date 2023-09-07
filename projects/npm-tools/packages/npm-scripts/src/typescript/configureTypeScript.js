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
const stringify = require('../utils/stringify');

const GENERATED = '@generated';
const OVERRIDES = '@overrides';
const TSCONFIG_JSON = 'tsconfig.json';

const isPlainObject = (value) => value?.constructor === Object;

function sortJSONKeys(json) {
	return Object.keys(json)
		.sort()
		.reduce((newJson, key) => {
			if (isPlainObject(json[key])) {
				newJson[key] = sortJSONKeys(json[key]);
			}
			else {
				newJson[key] = json[key];
			}

			return newJson;
		}, {});
}

/**
 * Given a dependency graph (from `getTypeScriptDependencyGraph()`),
 * configures the `tsconfig.json` file in the current working directory
 * and writes it back to disk if changes are needed. Unlike some other
 * config files involved in our build process which can be generated on
 * the fly during the build, this file must be committed to the repo in
 * order for editors and IDEs to benefit from LSP integration.
 *
 * As a convenience, returns the generated configuration object.
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
		//
		// If the ".ts" file is not found, we fall back using "index.d.ts"

		const main = dependency.main.replace(/\.js$/, '.ts');

		const resourceDirectory = path.join(
			dependency.directory,
			'src',
			'main',
			'resources',
			'META-INF',
			'resources'
		);

		const mainPath = path.join(resourceDirectory, main);

		paths[name] = [

			// TODO: don't hard-code "src/main/resources/META-INF/resources"
			// (we currently also hard-coded in `getJestModuleNameMapper()`)

			toPosix(
				path.relative(
					'',
					fs.existsSync(mainPath)
						? mainPath
						: path.join(
								resourceDirectory,
								path.dirname(main),
								'index.d.ts'
						  )
				)
			),
		];

		references.push({
			path: toPosix(path.relative('', dependency.directory)),
		});
	}

	const overrides = previousConfig[OVERRIDES] || {};

	const include = [...BASE_CONFIG.include];

	const globalDefinitionFile = path.join(root, 'global.d.ts');

	if (fs.existsSync(globalDefinitionFile)) {
		include.push(toPosix(path.relative('', globalDefinitionFile)));
	}

	const updatedConfig = sortJSONKeys(
		deepMerge([
			{
				...BASE_CONFIG,
				[OVERRIDES]: overrides,
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
				include,
				references: [...BASE_CONFIG.references, ...references],
			},
			overrides,
		])
	);

	updatedConfig[GENERATED] = hash(updatedConfig);

	if (
		updatedConfig[GENERATED] !== previousConfig[GENERATED] ||
		updatedConfig[GENERATED] !== hash(previousConfig)
	) {
		fs.writeFileSync(TSCONFIG_JSON, stringify(updatedConfig), 'utf8');
	}

	return updatedConfig;
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
