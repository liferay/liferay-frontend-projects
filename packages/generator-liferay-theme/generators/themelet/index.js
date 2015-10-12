'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var path = require('path');
var slug = require('slug');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');

var liferayThemeGeneratorPrototype = require('../app/index').prototype;

var getPrompts = liferayThemeGeneratorPrototype._getPrompts;

var importerGeneratorPrototype = _.merge(liferayThemeGeneratorPrototype, {
	initializing: function() {
		this.pkg = require('../../package.json');
	},

	configuring: {
		setThemeDirName: function() {
			var themeDirName = this.appname;

			if (!(/-themelet$/.test(themeDirName))) {
				themeDirName += '-themelet';
			}

			this.themeDirName = themeDirName;
		}
	},

	writing: {
		app: function() {
			this.template('_package.json', 'package.json', this);

			this.sourceRoot(path.join(this._sourceRoot, '../../app/templates'));

			this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));
		},

		projectfiles: function() {
			this.fs.copy(this.templatePath('src/css/**'), this.destinationPath('src/css'));
		}
	},

	install: _.noop,

	_getPrompts: function() {
		var instance = this;

		var prompts = getPrompts.call(instance);

		_.forEach(prompts, function(item, index) {
			var name = item.name;

			if (name == 'themeName') {
				item.default = 'My Liferay Themelet';
				item.message = 'What would you like to call your themelet?';
			}
			else if (name == 'themeId') {
				item.message = 'Would you like to use this as the themeletId?';
			}
			else if (name == 'liferayVersion') {
				item.message = 'Which version of Liferay is this themelet for?'
			}
		});

		return prompts;
	},

	_yosay: 'Welcome to the splendid ' + chalk.red('Liferay Themelet') + ' generator!'
});

module.exports = yeoman.generators.Base.extend(importerGeneratorPrototype);