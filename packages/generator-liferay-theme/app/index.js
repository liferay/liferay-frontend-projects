'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var slug = require('slug');
var _ = require('lodash');

module.exports = yeoman.generators.Base.extend({
	initializing: function () {
		this.pkg = require('../package.json');
	},

	prompting: function () {
		var done = this.async();

		// Have Yeoman greet the user.
		this.log(yosay(
			'Welcome to the splendid ' + chalk.red('Liferay Theme') + ' generator!'
		));

		var prompts = [
			{
				type: 'input',
				name: 'themeName',
				message: 'What would you like to call your theme?',
				default: 'My Liferay Theme'
			},
			{
				type: 'input',
				name: 'themeId',
				message: 'Would you like to use this as the themeId?',
				default: function(answers) {
					return slug((answers.themeName || '').toLowerCase());
				}
			},
			{
				type: 'confirm',
				name: 'supportCompass',
				message: 'Do you need Compass support? (requires Ruby and the Sass gem to be installed)',
				default: false
			}
		];

		this.prompt(prompts, function (props) {
			this.themeName = props.themeName;
			this.appname = props.themeId;
			this.supportCompass = props.supportCompass;

			var themeDirName = this.appname;

			if (!(/-theme$/.test(themeDirName))) {
				themeDirName += '-theme';
			}

			this.themeDirName = themeDirName;

			done();
		}.bind(this));
	},

	configuring: {
		enforceFolderName: function() {
			if (this.themeDirName !== _.last(this.destinationRoot().split(path.sep))) {
				this.destinationRoot(this.themeDirName);
			}

			this.config.save();
		},
	},

	writing: {
		app: function () {
			this.template('_package.json', 'package.json', this);
			this.template('_bower.json', 'bower.json', this);
		},

		projectfiles: function () {
			this.fs.copy(
				this.templatePath('gitignore'),
				this.destinationPath('.gitignore')
			);

			this.template('gulpfile.js', 'gulpfile.js', this);

			this.fs.copy(
				this.templatePath('src/**'),
				this.destinationPath('src')
			);

			this.template(
				'src/WEB-INF/liferay-plugin-package.properties', 'src/WEB-INF/liferay-plugin-package.properties',
				{
					themeDisplayName: this.themeName,
					liferayVersion: '6.2.0+'
				}
			);
		}
	},

	install: function () {
		var instance = this;

		this.installDependencies(
			{
				skipInstall: this.options['skip-install'],
				callback: function() {
					instance.spawnCommand('gulp', ['init']);
				}
			}
		);
	}
});