/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const {minify: terser} = require('terser');

const isJSP = require('../jsp/isJSP');
const processJSP = require('../jsp/processJSP');
const getMergedConfig = require('./getMergedConfig');
const getPaths = require('./getPaths');
const log = require('./log');

const BUILD_CONFIG = getMergedConfig('npmscripts', 'build');

const MINIFIER_CONFIG = getMergedConfig('terser');

const MINIFY_GLOBS = [
	path.posix.join(BUILD_CONFIG.output, '**', '*.js'),
	path.posix.join(BUILD_CONFIG.output, '**', '*.jsp'),
	path.posix.join(BUILD_CONFIG.output, '**', '*.jspf'),
	'!*-min.js',
	'!*.min.js',
];

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
						const result = await terser(input, {

							// TODO maybe simplify or change the options here

							...MINIFIER_CONFIG,
							format: {
								comments: /./, // TODO: keep hack comments in place
							},
						});

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
