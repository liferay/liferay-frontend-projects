/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const clay = require('./dependencies/clay');
const liferay = require('./dependencies/liferay');
const metal = require('./dependencies/metal');

module.exports = {
	build: {
		dependencies: [...clay, ...liferay, ...metal],
		input: 'src/main/resources/META-INF/resources',
		output: 'classes/META-INF/resources'
	},
	format: [
		'src/**/*.css',
		'src/**/*.js',
		'src/**/*.jspf',
		'src/**/*.jsp',
		'src/**/*.scss',
		'src/**/*.soy'
	],
	lint: [
		'src/**/*.css',
		'src/**/*.js',
		'src/**/*.jspf',
		'src/**/*.jsp',
		'src/**/*.scss',
		'src/**/*.soy'
	]
};
