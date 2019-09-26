/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const expandGlobs = require('./expandGlobs');
const getMergedConfig = require('./getMergedConfig');
const generateSoyDependencies = require('./generateSoyDependencies');
const log = require('./log');
const spawnSync = require('./spawnSync');

const BUILD_CONFIG = getMergedConfig('npmscripts', 'build');

/**
 * Compiles soy files by running `metalsoy` bin with specified soy dependencies
 */
function buildSoy() {
	spawnSync('metalsoy', [
		'--soyDeps',
		generateSoyDependencies(BUILD_CONFIG.dependencies),
		'--externalMsgFormat',
		"Liferay.Language.get('$2')"
	]);
}

/**
 * Removes any generated soy.js files
 */
function cleanSoy() {
	spawnSync('rimraf', ['src/**/*.soy.js']);
}

const EXTERNAL_MSG_REGEX = /var (MSG_EXTERNAL_\d+(?:\$\$\d+)?) = goog\.getMsg\(\s*'([\w,-{}$]+)'\s*(?:,\s*\{([\s\S]+?)\})?\);/g;

/**
 * Scans soy files in `directory` replacing calls to `goog.getMsg()`
 * with calls to `Liferay.Language.get()`.
 *
 * This covers compiled soy that comes in via NPM modules (eg. Clay v2.0
 * packages); in-tree soy is handled by `buildSoy()` and the
 * `--externalMsgFormat` option above.
 */
function translateSoy(directory) {
	const files = expandGlobs([path.join(directory, '**/*.soy.js')]);

	if (!files.length) {
		return;
	}

	let changedFiles = 0;

	files.forEach(file => {
		const contents = fs.readFileSync(file, 'utf8');

		const updated = contents.replace(EXTERNAL_MSG_REGEX, (match, p1, p2, p3) => {
				let externalMsg = match.replace(
					EXTERNAL_MSG_REGEX,
					`var $1 = Liferay.Language.get('$2');`
				);

				if (p3) {
					externalMsg = externalMsg.replace(/\{\$[^}]+}/g, 'x');

					externalMsg = externalMsg += `\n\t${p1} = ${p1}.replace(/{(\\d+)}/g, '\\x01$1\\x01');\n`;
				}

				return externalMsg;
			})

		if (contents !== updated) {
			changedFiles++;
			fs.writeFileSync(file, updated);
		}
	});

	if (changedFiles) {
		const objects = changedFiles === 1 ? 'file' : 'files';

		log(`Updated goog.getMsg() -> Liferay.Language.get() in ${changedFiles} ${objects}`);
	}
}

/**
 * Checks to see if there are any soy files
 */
function soyExists() {
	return !!expandGlobs([path.join(BUILD_CONFIG.input, '**/*.soy')]).length;
};

module.exports = {
	buildSoy,
	cleanSoy,
	soyExists,
	translateSoy,
};
