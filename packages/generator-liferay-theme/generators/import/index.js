'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var _ = require('lodash');

var liferayThemeGeneratorPrototype = require('../app/index').prototype;

liferayThemeGeneratorPrototype._prompts = [];

var importerGeneratorPrototype = _.merge(
	liferayThemeGeneratorPrototype,
	{
		initializing: function() {
			this.pkg = require('../../package.json');

			this.sourceRoot(path.join(this._sourceRoot, '../../app/templates'));
		},

		writing: {
			projectfiles: function() {
				this.copy('src/META-INF/context.xml', 'src/META-INF/context.xml');
			},

			themeFiles: function() {
				this.sourceRoot(this.importTheme);

				this.directory('docroot/_diffs', 'src');
				this.directory('docroot/WEB-INF', 'src/WEB-INF');
			}
		},

		_promptCallback: function(props) {
			this.appname = path.basename(props.importTheme);
			this.importTheme = props.importTheme;
			this.supportCompass = props.supportCompass;
		},

		_prompts: [
			{
				type: 'input',
				name: 'importTheme',
				message: 'What theme would you like to imort?',
				default: path.join(process.cwd(), 'mytheme-theme')
			},
			{
				type: 'confirm',
				name: 'supportCompass',
				message: 'Do you need Compass support? (requires Ruby and the Sass gem to be installed)',
				default: false
			}
		],

		_yosay: 'Welcome to the splendid ' + chalk.red('Liferay Theme Importer') + ' generator!'
	}
);

module.exports = yeoman.generators.Base.extend(importerGeneratorPrototype);