/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const filterGlobs = require('../utils/filterGlobs');
const getMergedConfig = require('../utils/getMergedConfig');
const log = require('../utils/log');
const spawnSync = require('../utils/spawnSync');

const DEFAULT_OPTIONS = {
	fix: false,
	quiet: false
};

/**
 * File extensions that ESLint can process.
 */
const EXTENSIONS = ['.js', '.ts', '.tsx'];

/**
 * Attempt to locate the "modules/" root directory in the liferay-portal repo by
 * walking up the tree looking for a yarn.lock.
 */
function findRoot() {
	let directory = process.cwd();

	while (directory) {
		if (fs.existsSync(path.join(directory, 'yarn.lock'))) {
			if (path.basename(directory) === 'modules') {
				return directory;
			} else {
				log(
					`Found a yarn.lock in ${directory}, but it is not the "modules/" root`
				);
			}
		}

		if (path.dirname(directory) === directory) {
			// Can't go any higher.
			directory = null;
		} else {
			directory = path.dirname(directory);
		}
	}
}

/**
 * Scan for ignore files at locations of the form:
 *
 *      apps/[group]/[project]/.eslintignore
 *
 * inside the modules root (ie. "modules/").
 */
function findProjectIgnoreFiles(root) {
	const cwd = `current working directory (${process.cwd()})`;

	if (!root) {
		log(`Unable to find "modules/" root from ${cwd}`);
		return [];
	}

	const apps = path.join(root, 'apps');

	try {
		if (!fs.statSync(apps).isDirectory()) {
			log(`"modules/apps/" in ${cwd} is not a directory`);
			return [];
		}
	} catch (_error) {
		log(`Unable to find "modules/apps/" from ${cwd}`);
		return [];
	}

	const entries = fs.readdirSync(apps).sort();

	return entries.reduce((acc, entry) => {
		const directory = path.join(apps, entry);

		if (fs.statSync(directory).isDirectory()) {
			const projects = fs.readdirSync(directory).sort();

			projects.forEach(project => {
				const ignore = path.join(directory, project, '.eslintignore');

				if (fs.existsSync(ignore)) {
					acc.push(ignore);
				}
			});
		}

		return acc;
	}, []);
}

/**
 * ESLint only allows for a single .eslintignore file, and only in the current
 * directory. In liferay-portal, however, we want the flexibility to have a
 * top-level .eslintignore under "modules/apps/" and then project-specific ones
 * that apply when running from a project subdirectory.
 *
 * When running from the modules root, we start with the top-level .eslintignore
 * file and concatenate all sub-project .eslintignore files after relativizing
 * the paths appropriately.
 *
 * When running from a specific project we just prepend the top-level
 * .eslintignore, without peforming any relativization.
 *
 * @see https://eslint.org/docs/user-guide/configuring
 */
function getIgnoreFilePath() {
	const ignores = fs.existsSync('.eslintignore')
		? [fs.readFileSync('.eslintignore').toString()]
		: [];

	const root = findRoot();

	if (process.cwd() === root) {
		findProjectIgnoreFiles(root).forEach(file => {
			const directory = path.relative('', path.dirname(file));
			const lines = fs
				.readFileSync(file)
				.toString()
				.split(/[\r\n]+/);

			// Make patterns relative to the "modules/" root.
			const patterns = lines.map(line => {
				const match = line.match(/^\s*(\S.+)$/);

				if (match) {
					if (match[1].startsWith('#')) {
						// Comment.
						return line;
					} else if (match[1].startsWith('!')) {
						// Negated pattern.
						return (
							'!' + path.join('/', directory, match[1].slice(1))
						);
					} else {
						// Normal pattern.
						return path.join('/', directory, match[1]);
					}
				} else {
					return line;
				}
			});

			ignores.push(patterns.join('\n'));
		});
	} else if (root) {
		// Prepend "modules/.eslintignore"
		const rootIgnore = path.join(root, '.eslintignore');

		if (fs.existsSync(rootIgnore)) {
			ignores.unshift(fs.readFileSync(rootIgnore).toString());
		} else {
			log(`Did not find expected .eslintignore at ${root}`);
		}
	} else {
		log(`Unable to find "modules/" root`);
	}

	const contents = ignores.join('\n');

	const directory = fs.mkdtempSync(
		path.join(os.tmpdir(), 'liferay-npm-scripts-')
	);

	const file = path.join(directory, '.eslintignore');

	fs.writeFileSync(file, contents);

	return file;
}

/**
 * ESLint wrapper.
 */
function lint(options = {}) {
	const {fix, quiet} = {
		...DEFAULT_OPTIONS,
		...options
	};

	const config = fix
		? getMergedConfig('npmscripts', 'fix')
		: getMergedConfig('npmscripts', 'check');

	const globs = filterGlobs(config, ...EXTENSIONS);

	if (!globs.length) {
		const extensions = EXTENSIONS.join(', ');

		log(
			`No globs applicable to ${extensions} files specified: globs can be configured via npmscripts.config.js`
		);

		return;
	}

	const configPath = path.join(process.cwd(), 'TEMP-eslint-config.json');

	fs.writeFileSync(configPath, JSON.stringify(getMergedConfig('eslint')));

	try {
		const ignorePath = getIgnoreFilePath();

		const args = [
			'--no-eslintrc',
			'--config',
			configPath,
			'--ignore-path',
			ignorePath,
			fix ? '--fix' : null,
			quiet ? '--quiet' : null,
			...globs
		].filter(Boolean);

		spawnSync('eslint', args);
	} finally {
		fs.unlinkSync(configPath);
	}
}

module.exports = lint;
