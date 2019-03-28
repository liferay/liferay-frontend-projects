/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const glob = require('glob');
const path = require('path');

const spawnSync = require('../utils/spawnSync');
const getMergedConfig = require('../utils/get-merged-config');
const generateSoyDependencies = require('../utils/generate-soy-dependencies');

const BUILD_CONFIG = getMergedConfig('npmscripts').build;

/**
 * Removes any generated soy.js files
 */
exports.cleanSoy = function() {
	spawnSync('rimraf', ['src/**/*.soy.js']);
};

/**
 * Compiles soy files by running `metalsoy` bin with specified soy dependencies
 */
exports.buildSoy = function() {
	spawnSync('metalsoy', [
		'--soyDeps',
		generateSoyDependencies(BUILD_CONFIG.dependencies),
		'--externalMsgFormat',
		"Liferay.Language.get('$2')"
	]);
};

/**
 * Checks to see if there are any soy files
 */
exports.soyExists = function() {
	return !!glob.sync(path.join(BUILD_CONFIG.input, '/**/*.soy')).length;
};
