/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs-extra');
const path = require('path');

const expandGlobs = require('./expandGlobs');
const generateSoyDependencies = require('./generateSoyDependencies');
const getMergedConfig = require('./getMergedConfig');
const log = require('./log');
const runBabel = require('./runBabel');
const spawnSync = require('./spawnSync');

const BUILD_CONFIG = getMergedConfig('npmscripts', 'build');

const SOY_TEMP_DIR = path.join(BUILD_CONFIG.temp, 'soy');

/**
 * Compiles soy files by running `metalsoy` bin with specified soy dependencies
 */
function buildSoy() {
	spawnSync('metalsoy', [
		'-s',
		path.join(BUILD_CONFIG.input, '**', '*.soy'),
		'-d',
		SOY_TEMP_DIR,
		'--soyDeps',
		generateSoyDependencies(BUILD_CONFIG.dependencies),
		'--externalMsgFormat',
		"Liferay.Language.get('$2')",
	]);

	runBabel(SOY_TEMP_DIR, '--out-dir', BUILD_CONFIG.output, '--source-maps');
}

/**
 * Removes any generated soy.js files
 */
function cleanSoy() {
	fs.removeSync(SOY_TEMP_DIR);
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
	const files = expandGlobs([path.posix.join(directory, '**/*.soy.js')]);

	if (!files.length) {
		return;
	}

	let changedFiles = 0;

	files.forEach((file) => {
		const contents = fs.readFileSync(file, 'utf8');

		const updated = contents.replace(
			EXTERNAL_MSG_REGEX,
			(match, binding, _template, params) => {

				/*
				 * Turn: var MSG_EXTERNAL_3292565618977302987 = goog.getMsg('all-selected');
				 * into: var MSG_EXTERNAL_3292565618977302987 = Liferay.Language.get('all-selected');
				 */
				let externalMsg = match.replace(
					EXTERNAL_MSG_REGEX,
					`var $1 = Liferay.Language.get('$2');`
				);

				/*
				 * Turn this (split across lines for readability; normally this
				 * would all be on one line):
				 *
				 *      var MSG_EXTERNAL_65349286544398424 = goog.getMsg(
				 *          '{$selectedItems}-of-{$totalItems}', {
				 *              'selectedItems': '\u00010\u0001',
				 *              'totalItems': '\u00011\u0001'
				 *          }
				 *      );
				 *
				 * into:
				 *
				 *      var MSG_EXTERNAL_65349286544398424 = Liferay.Language.get(
				 *          'x-of-x', {
				 *              'selectedItems': '\u00010\u0001',
				 *              'totalItems': '\u00011\u0001'
				 *          }
				 *      );
				 *      MSG_EXTERNAL_65349286544398424.replace(
				 *          /{(\d+)}/g,
				 *          '\x01$1\x01'
				 *      );
				 *
				 * @see https://github.com/google/closure-templates/blob/514a6381287d732e41fcab660305ebf33920a42f/java/src/com/google/template/soy/incrementaldomsrc/AssistantForHtmlMsgs.java#L105-L139
				 */
				if (params) {
					externalMsg = externalMsg.replace(/\{\$[^}]+}/g, 'x');

					externalMsg = externalMsg += `\n\t${binding} = ${binding}.replace(/{(\\d+)}/g, '\\x01$1\\x01');\n`;
				}

				return externalMsg;
			}
		);

		if (contents !== updated) {
			changedFiles++;
			fs.writeFileSync(file, updated);
		}
	});

	if (changedFiles) {
		const objects = changedFiles === 1 ? 'file' : 'files';

		log(
			`Updated goog.getMsg() -> Liferay.Language.get() in ${changedFiles} ${objects}`
		);
	}
}

/**
 * Checks to see if there are any soy files
 */
function soyExists() {
	return !!expandGlobs([path.posix.join(BUILD_CONFIG.input, '**/*.soy')])
		.length;
}

module.exports = {
	buildSoy,
	cleanSoy,
	soyExists,
	translateSoy,
};
