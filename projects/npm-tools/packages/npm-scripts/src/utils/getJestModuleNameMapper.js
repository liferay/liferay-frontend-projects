/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const getWorkspaces = require('./getWorkspaces');

/**
 * Where source really lives, relative to the directory containing the
 * "package.json" file.
 */
const SRC_PATH = ['src', 'main', 'resources', 'META-INF', 'resources'];

/**
 * Returns a Jest "moduleNameMapper" configuration that enables tests to
 * `import` modules from other projects.
 *
 * For example, in order for "segments/segments-web" to `import
 * {something} from 'frontend-js-web'`, we need mappings like:
 *
 *    "^frontend-js-web$": "<rootDir>../../frontend-js/frontend-js-web/src/main/resources/META-INF/resources/index.es.js"
 *
 * and:
 *
 *    "^frontend-js-web/(.*)": "<rootDir>../../frontend-js/frontend-js-web/src/main/resources/META-INF/resources/$1"
 *
 * We create such mappings by:
 *
 *    1. Iterating over projects identified by the Yarn workspace globs
 *       defined in the top-level "modules/package.json".
 *    2. Selecting only projects which have a "package.json" with a "main"
 *       property that points to an existing file under
 *       "src/main/resources/META-INF/resources".
 *
 * @see https://jestjs.io/docs/en/configuration#modulenamemapper-object-string-string
 */
function getJestModuleNameMapper() {

	// Note a limitation here: when running on a project under
	// "modules/private", the `root` will be "modules", and only projects under
	// "modules/apps" (not "modules/private/apps"), will be considered. This
	// means that, for now, tests in projects in "modules/private" can import
	// from projects under "modules/apps" but not from those under
	// "modules/private/apps".

	const cwd = process.cwd();

	const mappings = {};

	const projects = getWorkspaces();

	projects.forEach((project) => {
		const packageJson = path.join(project, 'package.json');

		const {main, name} = JSON.parse(fs.readFileSync(packageJson, 'utf8'));

		if (main) {
			const entry = path.join(project, ...SRC_PATH, main);

			// Handle typical formats for "main":
			//
			// - index        -> index.js
			// - index.es     -> index.es.js
			// - index.es.js  -> index.es.js
			// - index.js     -> index.js
			// - index.js     -> index.ts

			const candidates = [entry];

			if (entry.endsWith('.js')) {
				candidates.push(entry.replace(/\.js$/, '.ts'));
			}
			else {
				candidates.push(entry + '.js');
			}

			for (let i = 0; i < candidates.length; i++) {
				const candidate = candidates[i];

				if (fs.existsSync(candidate)) {
					const resources = path.relative(
						cwd,
						path.join(project, ...SRC_PATH)
					);

					mappings[`^${name}$`] = `<rootDir>${path.relative(
						cwd,
						candidate
					)}`;

					mappings[`^${name}/(.*)`] = `<rootDir>${resources}/$1`;

					break;
				}
			}
		}
	});

	return {
		moduleNameMapper: mappings,
	};
}

module.exports = getJestModuleNameMapper;
