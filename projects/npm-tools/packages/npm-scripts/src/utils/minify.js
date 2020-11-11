/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const {minify: terser} = require('terser');

const getMergedConfig = require('./getMergedConfig');
const getPaths = require('./getPaths');
const log = require('./log');

const BUILD_CONFIG = getMergedConfig('npmscripts', 'build');

const MINIFIER_CONFIG = getMergedConfig('terser');

const MINIFY_GLOBS = [
	path.posix.join(BUILD_CONFIG.output, '**', '*.js'),
	'!*-min.js',
	'!*.min.js',
];

async function minify() {
	const start = Date.now();

	const paths = getPaths(MINIFY_GLOBS, [], '', {useDefaultIgnores: false});

	let successes = 0;
	let errors = 0;
	let before = 0;
	let after = 0;

	for (const source of paths) {
		const contents = fs.readFileSync(source, 'utf8');

		before += contents.length;

		const sourceMap = {
			url: path.basename(source) + '.map',
		};

		if (fs.existsSync(source + '.map')) {
			sourceMap.content = fs.readFileSync(source + '.map', 'utf8');
		}

		try {
			const result = await terser(contents, {
				...MINIFIER_CONFIG,
				sourceMap,
			});

			if (result.code !== contents) {
				fs.writeFileSync(source, result.code);
				fs.writeFileSync(source + '.map', result.map);

				if (process.env.DEBUG) {
					log(
						`${contents.length} -> ${result.code.length}: ${source}`
					);
				}
			}

			after += result.code.length;
			successes++;
		}
		catch (error) {
			if (process.env.DEBUG) {
				log(`[ignored: ${error}]: ${source}`);
			}

			errors++;
		}
	}

	log(
		'Summary:',
		`  Files minified: ${successes}`,
		`  Files skipped:  ${errors}`,
		`  Before size:    ${before}`,
		`  After size:     ${after}`,
		`  Delta:          ${before - after}`,
		`  Elapsed:        ${((Date.now() - start) / 1000).toFixed(2)}`
	);
}

module.exports = minify;
