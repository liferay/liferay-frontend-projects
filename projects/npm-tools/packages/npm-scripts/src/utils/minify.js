/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const {minify: terser} = require('terser');

const isJSP = require('../jsp/isJSP');
const {PADDING_MARKER} = require('../jsp/padLines');
const processJSP = require('../jsp/processJSP');
const {SCRIPTLET_CONTENT} = require('../jsp/substituteTags');
const {BLOCK_CLOSE, BLOCK_OPEN} = require('../jsp/tagReplacements');
const {FILLER_CHAR, SPACE_CHAR, TAB_CHAR} = require('../jsp/toFiller');
const getMergedConfig = require('./getMergedConfig');
const getPaths = require('./getPaths');
const log = require('./log');

const BUILD_CONFIG = getMergedConfig('npmscripts', 'build');

const BUILD = BUILD_CONFIG.output;

const MINIFIER_CONFIG = getMergedConfig('terser');

const MINIFY_GLOBS = [
	path.posix.join(BUILD, '**', '*.js'),
	'!*-min.js',
	'!*.min.js',
	'!node_modules',
];

if (process.env.MINIFY_JSP) {
	MINIFY_GLOBS.push(
		path.posix.join(BUILD, '**', '*.jsp'),
		path.posix.join(BUILD, '**', '*.jspf')
	);
}

/**
 * We need to keep "special" JSP comments so that we can reverse the various
 * transformations that we need to apply in order to make the "JS" in there
 * actually parseable. So, we produce a RegExp that looks something like this:
 *
 *      /ʅ|ʃ|╳|«pad»|Ɯ|ɸ|Ƭ/
 *
 */
const JSP_COMMENT_REGEXP = new RegExp(
	[
		BLOCK_CLOSE,
		BLOCK_OPEN,
		FILLER_CHAR,
		PADDING_MARKER,
		SPACE_CHAR,
		SCRIPTLET_CONTENT,
		TAB_CHAR,
	].join('|')
);

async function minify() {
	const start = Date.now();

	const paths = getPaths(MINIFY_GLOBS, [], '', {useDefaultIgnores: false});

	let afterSize = 0;
	let beforeSize = 0;
	let errorCount = 0;

	for (const source of paths) {
		const contents = fs.readFileSync(source, 'utf8');

		beforeSize += contents.length;

		if (isJSP(source)) {
			const errors = [];

			const processed = await processJSP(contents, {
				async onMinify(input) {
					try {
						/* eslint-disable sort-keys */

						const result = await terser(input, {
							...MINIFIER_CONFIG,

							// We can't risk renaming or reordering
							// anything because JSP's may contain
							// "hidden" code (via interpolation).

							compress: {
								defaults: false,
							},

							format: {

								// Add `beautify: true` here to debug tests, if
								// necessary.

								braces: true,
								comments: JSP_COMMENT_REGEXP,
							},

							mangle: false,
						});

						/* eslint-enable sort-keys */

						return result.code;
					}
					catch (error) {
						errors.push(error);

						return input;
					}
				},
			});

			if (errors.length) {
				if (process.env.DEBUG) {
					log(
						`[error: ${errors
							.map((error) => error.toString())
							.join(', ')}]: ${source}`
					);
				}

				errorCount++;
			}

			if (processed !== contents) {
				fs.writeFileSync(source, processed);

				if (process.env.DEBUG) {
					log(`${contents.length} -> ${processed.length}: ${source}`);
				}
			}

			afterSize += processed.length;
		}
		else {
			const sourceMap = {
				url: path.basename(source) + '.map',
			};

			if (fs.existsSync(source + '.map')) {
				sourceMap.content = fs.readFileSync(source + '.map', 'utf8');
			}

			let result;

			try {
				result = await terser(contents, {
					...MINIFIER_CONFIG,
					sourceMap,
				});
			}
			catch (error) {
				if (process.env.DEBUG) {
					log(`[error: ${error}]: ${source}`);
				}

				errorCount++;
			}

			if (result && result.code !== contents) {
				fs.writeFileSync(source, result.code);
				fs.writeFileSync(source + '.map', result.map);

				if (process.env.DEBUG) {
					log(
						`${contents.length} -> ${result.code.length}: ${source}`
					);
				}

				afterSize += result.code.length;
			}
			else {
				afterSize += contents.length;
			}
		}
	}

	log(
		'Minification summary:',
		`  Files processed:   ${paths.length}`,
		`  Files with errors: ${errorCount}`,
		`  Before size:       ${beforeSize}`,
		`  After size:        ${afterSize}`,
		`  Delta:             ${beforeSize - afterSize}`,
		`  Elapsed:           ${((Date.now() - start) / 1000).toFixed(2)}`
	);
}

module.exports = minify;
