/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const lfrThemeConfig = require('../lib/liferay_theme_config');
const ExtendPrompt = require('../lib/prompts/extend_prompt');

module.exports = function(options) {
	const gulp = options.gulp;

	gulp.task('extend', cb => {
		ExtendPrompt.prompt(
			{
				themeConfig: lfrThemeConfig.getConfig(),
			},
			cb
		);
	});
};
