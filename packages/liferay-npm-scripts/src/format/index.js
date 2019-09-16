/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const formatJSP = require('../format/formatJSP');
const getPaths = require('../utils/getPaths');
const getMergedConfig = require('../utils/getMergedConfig');
const log = require('../utils/log');

/**
 * File extensions that we want to process.
 */
const EXTENSIONS = ['.jsp', '.jspf'];

// TODO: consider ESLint's ignorefile too.
const IGNORE_FILE = '.prettierignore';

/**
 * Test with:
 *
 *      yarn run liferay-npm-scripts csf '**''/*.{jsp,jspf}'
 */
module.exports = function(args) {
	const globs = args;

	const paths = getPaths(globs, EXTENSIONS, IGNORE_FILE);

	if (!paths.length) {
		return;
	}

	const prettierConfig = getMergedConfig('prettier');

	let checkedCount = 0;
	let errorCount = 0;
	let issueCount = 0;
	let skippedCount = 0;

	paths.forEach(filepath => {
		try {
			const source = fs.readFileSync(filepath, 'utf8');

			const result = formatJSP(source, prettierConfig);

			if (result === null) {
				skippedCount++;
			} else {
				checkedCount++;

				if (source !== result) {
					issueCount++;

					if (process.env.WRITE) {
						log(`Wrote: ${filepath}`);
						fs.writeFileSync(filepath, result);
					}
				}
			}
		} catch (error) {
			// TODO: proper error handling
			// TODO: deal with errors that stem from unterminated string literals
			log(`Error in ${filepath}: ${error}`);
			errorCount++;
		}
	});

	log(
		`Checked: ${checkedCount}, Issues: ${issueCount}, Errors: ${errorCount}, Skipped: ${skippedCount}`
	);
};
