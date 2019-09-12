/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const formatJSP = require('../format/formatJSP');
const expandGlobs = require('../utils/expandGlobs');
const filterChangedFiles = require('../utils/filterChangedFiles');
const filterGlobs = require('../utils/filterGlobs');
const findRoot = require('../utils/findRoot');
const getMergedConfig = require('../utils/getMergedConfig');
const log = require('../utils/log');
const preprocessGlob = require('../utils/preprocessGlob');
const readIgnoreFile = require('../utils/readIgnoreFile');

/**
 * File extensions that we want to process.
 */
const EXTENSIONS = ['.jsp', '.jspf'];

/**
 * Test with:
 *
 *      yarn run liferay-npm-scripts csf '**''/*.{jsp,jspf}'
 */
module.exports = function(args) {
	let globs = args;

	// Turn "{a,b}/*" into ["a/*", "b/*"]:
	const preprocessedGlobs = [];

	globs.forEach(glob => preprocessedGlobs.push(...preprocessGlob(glob)));

	globs = filterGlobs(preprocessedGlobs, ...EXTENSIONS);

	if (!globs.length) {
		const extensions = EXTENSIONS.join(', ');

		log(
			// TODO: make "globs can be configured" actually true
			`No globs applicable to ${extensions} files specified: globs can be configured via npmscripts.config.js`
		);

		return;
	}

	// TODO: consider ESLint's ignorefile too.
	const root = findRoot();
	const ignoreFile = path.join(root || '.', '.prettierignore');

	const ignores = fs.existsSync(ignoreFile) ? readIgnoreFile(ignoreFile) : [];

	// Match Prettier behavior and ignore node_modules by default.
	if (ignores.indexOf('node_modules/**') === -1) {
		ignores.unshift('node_modules/**');
	}

	globs = expandGlobs(globs, ignores);

	// TODO: after testing phase is over, will filterChangedFiles
	// unconditionally
	const paths = process.env.ONLY_CHANGED ? filterChangedFiles(globs) : globs;

	const prettierConfig = getMergedConfig('prettier');

	let checkedCount = 0;
	let errorCount = 0;
	let issueCount = 0;
	let skippedCount = 0;

	paths.forEach(filepath => {
		try {
			const source = fs.readFileSync(filepath).toString();

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
			// TODO: deal with errors that steam from unterminated string literals
			log(`Error in ${filepath}: ${error}`);
			errorCount++;
		}
	});

	log(
		`Checked: ${checkedCount}, Issues: ${issueCount}, Errors: ${errorCount}, Skipped: ${skippedCount}`
	);
};
