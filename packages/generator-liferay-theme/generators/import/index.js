'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var util = require('util');

var liferayThemeGeneratorPrototype = require('../app/index').prototype;

var importerGeneratorPrototype = _.merge(liferayThemeGeneratorPrototype, {
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

	_getPrompts: function() {
		var instance = this;

		return [
			{
				default: path.join(process.cwd(), 'mytheme-theme'),
				message: 'What theme would you like to import?',
				name: 'importTheme',
				type: 'input',
				validate: instance._validatePath
			},
			{
				default: false,
				message: 'Do you need Compass support? (requires Ruby and the Sass gem to be installed)',
				name: 'supportCompass',
				type: 'confirm'
			}
		];
	},

	_setLiferayVersion: function() {
		var packageProperties = fs.readFileSync(path.join(this.importTheme, 'docroot/WEB-INF/liferay-plugin-package.properties'), {
			encoding: 'utf8'
		});

		var match = packageProperties.match(/liferay-versions=([0-9]\.[0-9])\..*\+/);

		if (match) {
			this.liferayVersion = match[1];
		}
	},

	_promptCallback: function(props) {
		this.appname = path.basename(props.importTheme);
		this.importTheme = props.importTheme;
		this.supportCompass = props.supportCompass;

		this._setLiferayVersion();
	},

	_validatePath: function(filePath) {
		var retVal = false;

		if (filePath) {
			retVal = true;

			if (!fs.existsSync(filePath)) {
				retVal = '"%s" does not exist';
			}
			else if (!fs.statSync(filePath).isDirectory()) {
				retVal = '"%s" is not a directory';
			}
			else {
				var propsFile = path.join(filePath, 'docroot', 'WEB-INF', 'liferay-plugin-package.properties');

				if (!fs.existsSync(propsFile) || !fs.statSync(propsFile).isFile()) {
					retVal = '"%s" doesn\'t appear to be a theme in the SDK';
				}
			}
		}

		if (_.isString(retVal)) {
			retVal = util.format(retVal, filePath);
		}

		return retVal;
	},

	_yosay: 'Welcome to the splendid ' + chalk.red('Liferay Theme Importer') + ' generator!'
});

module.exports = yeoman.generators.Base.extend(importerGeneratorPrototype);