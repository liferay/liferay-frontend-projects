'use strict';

let ExtendPrompt = require('../lib/prompts/extend_prompt');
let lfrThemeConfig = require('../lib/liferay_theme_config');

module.exports = function(options) {
	let gulp = options.gulp;

	gulp.task('extend', function(cb) {
		ExtendPrompt.prompt(
			{
				themeConfig: lfrThemeConfig.getConfig(),
			},
			cb
		);
	});
};
