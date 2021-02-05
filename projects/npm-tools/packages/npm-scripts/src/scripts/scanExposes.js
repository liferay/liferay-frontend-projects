/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const getMergedConfig = require('../utils/getMergedConfig');

/**
 * Main script that scans JSP files for JS modules and writes a proposed
 * `exposes` section for the `npmscripts.config.js` file.
 */
module.exports = async function (...args) {
	const {input} = getMergedConfig('npmscripts', 'build');

	const update = args.includes('-u');
	const verbose = args.includes('-v');

	const exposes = scanJSPs(input, verbose);

	if (verbose) {
		console.log('');
	}

	console.log(exposes);

	if (update) {
		try {
			let config = fs.readFileSync('npmscripts.config.js', 'utf8');

			config +=
				'module.exports.federation = module.exports.federation || {};\n';
			config += 'module.exports.federation.exposes = [\n';

			exposes.forEach((expose) => {
				config += `  '${expose}',\n`;
			});

			config += '];';

			fs.writeFileSync('npmscripts.config.js', config);
		}
		catch (err) {
			if (err.code !== 'ENOENT') {
				throw err;
			}

			fs.writeFileSync(
				'npmscripts.config.js',
				`/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

module.exports = {
	federation: {
		exposes: [
${exposes.map((expose) => `			'${expose}',`)}
		]
	},
	preset: '@liferay/npm-scripts/src/presets/standard',
};`
			);
		}
	}
};

function scanJSPs(dir, verbose) {
	const exposes = [];

	const items = fs.readdirSync(dir);

	items.forEach((item) => {
		const itemPath = path.join(dir, item);

		if (fs.statSync(itemPath).isDirectory()) {
			exposes.push(...scanJSPs(itemPath));
		}
		else if (itemPath.toLowerCase().endsWith('.jsp')) {
			const regexp = /(module|propsTransformer)="([^"]*)"/g;
			const contents = fs.readFileSync(itemPath, 'utf8');

			let match;

			while ((match = regexp.exec(contents)) !== null) {
				exposes.push(`<inputDir>/${match[2]}.js`);

				if (verbose) {
					console.log(itemPath, ':', match[2]);
				}
			}
		}
	});

	return exposes;
}
