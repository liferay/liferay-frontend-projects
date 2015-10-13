'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var path = require('path');
var slug = require('slug');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');

module.exports = yeoman.generators.Base.extend({
	initializing: function() {
		this.pkg = require('../../package.json');
	},

	prompting: function() {
		var done = this.async();

		// Have Yeoman greet the user.
		this.log(yosay(this._yosay));

		this.prompt(this._getPrompts(), function(props) {
			this._promptCallback(props);

			done();
		}.bind(this));
	},

	configuring: {
		setThemeDirName: function() {
			var themeDirName = this.appname;

			if (!(/-theme$/.test(themeDirName))) {
				themeDirName += '-theme';
			}

			this.themeDirName = themeDirName;
		},

		enforceFolderName: function() {
			if (this.themeDirName !== _.last(this.destinationRoot().split(path.sep))) {
				this.destinationRoot(this.themeDirName);
			}

			this.config.save();
		}
	},

	writing: {
		app: function() {
			this.template('_package.json', 'package.json', this);

			this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));

			this.template('gulpfile.js', 'gulpfile.js', this);
		},

		projectfiles: function() {
			this.fs.copy(this.templatePath('src/**'), this.destinationPath('src'), {
				globOptions: {
					ignore: this.templatePath('src/css/custom.css')
				}
			});

			var customCssName = 'custom.css';

			if (this.liferayVersion > 6.2) {
				customCssName = '_custom.scss';
			}

			this.fs.copy(this.templatePath('src/css/custom.css'), this.destinationPath('src/css/' + customCssName));

			this.template(
				'src/WEB-INF/liferay-plugin-package.properties',
				'src/WEB-INF/liferay-plugin-package.properties',
				{
					liferayVersion: this.liferayVersion + '.0+',
					themeDisplayName: this.themeName
				}
			);
		}
	},

	install: function() {
		var instance = this;

		var skipInstall = this.options['skip-install'];

		this.installDependencies({
			bower: false,
			callback: function() {
				if (!skipInstall) {
					instance.spawnCommand('gulp', ['init']);
				}
			}
		});
	},

	_getPrompts: function() {
		var instance = this;

		return [
			{
				default: 'My Liferay Theme',
				message: 'What would you like to call your theme?',
				name: 'themeName',
				type: 'input'
			},
			{
				default: function(answers) {
					return slug((answers.themeName || '').toLowerCase());
				},
				message: 'Would you like to use this as the themeId?',
				name: 'themeId',
				type: 'input'
			},
			{
				message: 'Which version of Liferay is this theme for?',
				name: 'liferayVersion',
				choices: ['7.0', '6.2'],
				type: 'list'
			},
			{
				default: false,
				message: 'Do you need Compass support? (requires Ruby and the Sass gem to be installed)',
				name: 'supportCompass',
				type: 'confirm'
			}
		];
	},

	_promptCallback: function(props) {
		this.appname = props.themeId;
		this.liferayVersion = props.liferayVersion;
		this.supportCompass = props.supportCompass;
		this.themeName = props.themeName;
	},

	_yosay: 'Welcome to the splendid ' + chalk.red('Liferay Theme') + ' generator!'
});