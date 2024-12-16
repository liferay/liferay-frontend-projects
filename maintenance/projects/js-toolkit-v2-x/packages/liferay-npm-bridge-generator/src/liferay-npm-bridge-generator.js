/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import globby from 'globby';
import path from 'path';
import readJsonSync from 'read-json-sync';
import yargs from 'yargs';

const argv = yargs

	// Whether or not to explain what's going on

	.option('verbose', {
		alias: 'v',
		default: false,
	}).argv;

// Default template used to generate bridges

const defaultTemplate = `Liferay.Loader.define('{PKG_NAME}@{PKG_VERSION}/{DEST_MOD}', ['module', '{SRC_MOD}'], function (module, src) {
  module.exports = src;
});
`;

/**
 * Main entry point
 * @return {void}
 */
export default function main() {
	const pkgJson = readJsonSync('./package.json');
	const config = readJsonSync('./.npmbridgerc');

	Object.keys(config).forEach((key) => {
		const opts = config[key];

		log(`'${key}' bridges:`);

		// Input folder where source modules live

		const input =
			opts['input'] || 'classes/META-INF/resources/node_modules';

		// Output folder where bridge modules must be placed

		const output = opts['output'] || 'classes/META-INF/resources/bridge';

		// The glob expression(s) to filter source modules

		const fileGlobs = opts['file-globs'] || '**/lib/**/*.js';

		// A mapper to convert source file paths to destination file paths

		const destFileMapper = opts['dest-file-mapper'] || {
			from: '(.*)\\$(.*)@.*/lib/(.*)',
			to: '$2/src/$3',
		};

		// A mapper to convert source file paths to source module names

		const srcModNameMapper = opts['src-mod-name-mapper'] || {
			from: '(.*)@[^/]*(.*)\\.js$',
			to: '$1$2',
		};

		// A mapper to convert destination file paths to destination module names

		const destModNameMapper = opts['dest-mod-name-mapper'] || {
			from: '(.*)\\.js$',
			to: 'bridge/$1',
		};

		// Template used to generate bridges

		const template = opts['template'] || defaultTemplate;

		// Go!

		globby
			.sync(fileGlobs.split(','), {
				cwd: input,
			})
			.forEach((srcFile) => {
				const destFile = srcFile.replace(
					new RegExp(destFileMapper.from),
					destFileMapper.to
				);
				const srcMod = srcFile.replace(
					new RegExp(srcModNameMapper.from),
					srcModNameMapper.to
				);
				const destMod = destFile.replace(
					new RegExp(destModNameMapper.from),
					destModNameMapper.to
				);
				const absDestFile = path.join(output, destFile);

				let contents = template;

				contents = contents.replace('{PKG_NAME}', pkgJson.name);
				contents = contents.replace('{PKG_VERSION}', pkgJson.version);
				contents = contents.replace('{SRC_MOD}', srcMod);
				contents = contents.replace('{DEST_MOD}', destMod);

				fs.mkdirsSync(path.dirname(absDestFile));
				fs.writeFileSync(absDestFile, contents);

				log(srcFile, '->', destFile);
			});
	});
}

/**
 * Log a message if verbose argument is active.
 * @param  {Array} args arguments given to the function
 * @return {void}
 */
function log(...args) {
	if (argv.verbose) {
		console.log(...args);
	}
}
