/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const findRoot = require('../utils/findRoot');
const log = require('../utils/log');

const root = findRoot();

const npmScriptsCacheDir = path.join(root, '.npmscripts');

module.exports = function (...args) {
	const cacheExists = fs.existsSync(npmScriptsCacheDir);

	if (!cacheExists) {
		log(`CACHE: Does not exist.`);
	}

	if (args.includes('--clean')) {
		if (cacheExists) {
			log(`CACHE: Removing '${npmScriptsCacheDir}'`);

			fs.rmdirSync(npmScriptsCacheDir, {recursive: true});
		}
	}
	else {
		if (cacheExists) {
			log(`CACHE: Located at '${npmScriptsCacheDir}'`);
		}
		else {
			log(`CACHE: None`);
		}
	}
};
