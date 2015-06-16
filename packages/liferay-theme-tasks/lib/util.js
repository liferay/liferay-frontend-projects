'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs-extra');
var gulp = require('gulp');
var path = require('path');
var plugins = require('gulp-load-plugins')();

var fullDeploy = (argv.full || argv.f);

plugins.storage(gulp);

var store = gulp.storage;

store.create('LiferayTheme', 'liferay-theme.json');

module.exports = {
	getSrcPath: function(srcPath, validator) {
		var changedFile = store.get('changedFile');

		var changed = (changedFile && (changedFile.type == 'changed'));

		var fastDeploy = (!fullDeploy && store.get('deployed'));

		if (changed && fastDeploy) {
			var changedFileName = path.basename(changedFile.path);

			if (validator && !validator(changedFileName)) {
				return srcPath;
			}

			srcPath = path.join(srcPath, '..', changedFileName);
		}

		return srcPath;
	},

	getLanguageProperties: function() {
		var pathContent = path.join('./build', 'WEB-INF/src/content');

		var languageKeys = [];

		if (fs.existsSync(pathContent) && fs.statSync(pathContent).isDirectory()) {
			var contentFiles = fs.readdirSync(pathContent);

			_.forEach(
				contentFiles,
				function(item, index) {
					if (item.match(/Language.*properties/)) {
						var xmlElement = '<language-properties>content/' + item + '</language-properties>';

						languageKeys.push(xmlElement);
					}
				}
			);
		}

		return languageKeys;
	},

	isCssFile: function (name) {
		return name.indexOf('.css') > -1;
	}
};