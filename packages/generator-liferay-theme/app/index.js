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
			}
		];

		this.prompt(prompts, function (props) {
			this.themeName = props.themeName;
			this.themeId = props.themeId;

			var themeDirName = this.themeId;

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
		},
	},

	writing: {
		app: function () {
			this.fs.copy(
				this.templatePath('_package.json'),
				this.destinationPath('package.json')
			);
			this.fs.copy(
				this.templatePath('_bower.json'),
				this.destinationPath('bower.json')
			);
		},

		projectfiles: function () {
			this.fs.copy(
				this.templatePath('gitignore'),
				this.destinationPath('.gitignore')
			);
		}
	},

	install: function () {
		this.installDependencies({
			skipInstall: this.options['skip-install']
		});
	}
});