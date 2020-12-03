/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const ExtendPrompt = require('../lib/prompts/extend_prompt');
const lfrThemeConfig = require('../lib/liferay_theme_config');

module.exports = function(options) {
	const gulp = options.gulp;

	gulp.task('extend', function(cb) {
		ExtendPrompt.prompt(
			{
				themeConfig: lfrThemeConfig.getConfig(),
			},
			cb
		);
	});
};
