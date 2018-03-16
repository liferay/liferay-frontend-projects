'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var fs = require('fs');
var minimist = require('minimist');
var path = require('path');
var yeoman = require('yeoman-generator');
var util = require('util');

var liferayThemeGeneratorPrototype = _.cloneDeep(require('../app/index').prototype);

var initializing = liferayThemeGeneratorPrototype.initializing;

var importerGeneratorPrototype = _.merge(liferayThemeGeneratorPrototype, {
	writing: {
		projectfiles: _.noop,

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
				validate: instance._validatePath,
				when: instance._getWhenFn('importTheme', 'path')
			}
		];
	},

	_getSettingFromConfigFile: function(config) {
		var defaultValue = config.defaultValue;

		var filePath = path.join(this.importTheme, config.filePath);

		var match;

		try {
			var fileContents = fs.readFileSync(filePath, {
				encoding: 'utf8'
			});

			match = fileContents.match(config.regex);

			if (match) {
				defaultValue = match[1];
			}
		}
		catch(e) {
			this.log(chalk.yellow('   Warning ') + '%s not found', filePath);
		}

		if (!match) {
			this.log(chalk.yellow('   Warning ') + 'could not determine the property %s from ' + chalk.yellow('%s') + '. Using ' + chalk.yellow('%s') + ' as default value.', config.propertyNameInFile, filePath, config.defaultValue);
		}

		this[config.propertyName] = defaultValue;
	},

	_promptCallback: function(props) {
		this.appname = path.basename(props.importTheme);
		this.importTheme = props.importTheme;

		this._getSettingFromConfigFile({
			defaultValue: '6.2',
			filePath: 'docroot/WEB-INF/liferay-plugin-package.properties',
			propertyName: 'liferayVersion',
			propertyNameInFile: 'liferay-versions',
			regex: /liferay-versions=([0-9]\.[0-9])/
		});

		var liferayVersion = this.liferayVersion;

    if(liferayVersion !== '6.2') {
      throw new Error('Only themes for 6.2 version of Liferay can be imported');
    }

		this._setPackageVersion(liferayVersion);

		this._getSettingFromConfigFile({
			defaultValue: 'vm',
			filePath: 'docroot/WEB-INF/liferay-look-and-feel.xml',
			propertyName: 'templateLanguage',
			propertyNameInFile: '<template-extension>',
			regex: /<template-extension>(.*)<\/template-extension>/
		});
	},

	_setArgv: function() {
		this.argv = minimist(process.argv.slice(2), {
			alias: {
				compass: 'c',
				path: 'p'
			},
			default: {
				compass: null
			},
			boolean: ['compass']
		});
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

	_track: function() {
		var insight = this._insight;

		var liferayVersion = this.liferayVersion;

		insight.track('import', liferayVersion);
	},

	_yosay: 'Welcome to the splendid ' + chalk.red('Liferay Theme Importer') + ' generator!'
});

module.exports = yeoman.generators.Base.extend(importerGeneratorPrototype);
