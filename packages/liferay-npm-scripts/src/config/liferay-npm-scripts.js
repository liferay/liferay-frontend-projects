/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const standardPreset = require('liferay-npm-scripts-preset-standard');

module.exports = {
	preset: 'standard',
	build: {
		dependencies: [],
		input: standardPreset.build.input,
		output: standardPreset.build.output
	},
	format: [],
	lint: []
};
