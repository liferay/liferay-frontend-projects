'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var path = require('path');
var slug = require('slug');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');

var liferayThemeGeneratorPrototype = require('../app/index').prototype;

var getPrompts = liferayThemeGeneratorPrototype._getPrompts;
var promptCallback = liferayThemeGeneratorPrototype._promptCallback;

var importerGeneratorPrototype = _.merge(liferayThemeGeneratorPrototype, {
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
			this.fs.copy(this.templatePath('src/css/custom.css'), this.destinationPath('src/css/_custom.scss'));
		}
	},

	install: _.noop,

	_getPrompts: function() {
		var instance = this;

		var prompts = getPrompts.call(instance);

		prompts = _.reduce(prompts, function(result, item, index) {
			var name = item.name;

			if (name == 'themeName') {
				item.default = 'My Liferay Themelet';
				item.message = 'What would you like to call your themelet?';
			}
			else if (name == 'themeId') {
				item.message = 'Would you like to use this as the themeletId?';
			}
			else if (name == 'liferayVersion') {
				item.choices = ['7.0', '6.2', 'All'];
				item.message = 'Which version of Liferay is this themelet for?'
			}

			if (name != 'supportCompass' && name != 'templateLanguage') {
				result.push(item);
			}

			return result;
		}, []);

		return prompts;
	},

	_promptCallback: function(props) {
		promptCallback.call(this, props);

		var liferayVersion = props.liferayVersion;
		var publishTag = null;

		if (liferayVersion != 'All') {
			publishTag = liferayVersion.replace('.', '_') + '_x';
		}
		else {
			this.liferayVersion = '*';
		}

		this.publishTag = publishTag;

		var packageVersion = '0.0.0';

		if (liferayVersion == '7.0') {
			packageVersion = '1.0.0';
		}

		this.packageVersion = packageVersion;
	},

	_track: function() {
		this._insight.track('themelet', this.liferayVersion);
	},

	_yosay: 'Welcome to the splendid ' + chalk.red('Liferay Themelet') + ' generator!'
});

module.exports = yeoman.generators.Base.extend(importerGeneratorPrototype);