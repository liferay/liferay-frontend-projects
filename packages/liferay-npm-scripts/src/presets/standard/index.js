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
	check: [
		'{src,test}/**/*.css',
		'{src,test}/**/*.js',
		'{src,test}/**/*.scss'
	],
	fix: ['{src,test}/**/*.css', '{src,test}/**/*.js', '{src,test}/**/*.scss']
};
