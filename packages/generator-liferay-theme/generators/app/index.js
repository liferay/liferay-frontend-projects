'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var Insight = require('insight');
var minimist = require('minimist');
var path = require('path');
var slug = require('slug');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');

module.exports = yeoman.generators.Base.extend({
	initializing: function() {
		var pkg = require('../../package.json');

		this.pkg = pkg;

		this._insight = new Insight({
			trackingCode: 'UA-69122110-1',
			pkg: pkg
		});
	},

	prompting: function() {
		var instance = this;

		instance.done = instance.async();

		this._setArgv();

		// Have Yeoman greet the user.
		instance.log(yosay(instance._yosay));

		var insight = this._insight;

		if (_.isUndefined(insight.optOut)) {
			insight.askPermission(null, _.bind(this._prompt, this));
		}
		else {
			this._prompt();
		}
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

			this.template('src/WEB-INF/liferay-look-and-feel.xml', 'src/WEB-INF/liferay-look-and-feel.xml', this);
		}
	},

	install: function() {
		var instance = this;

		var skipInstall = this.options['skip-install'];

		if (!skipInstall) {
			this.installDependencies({
				bower: false,
				callback: function() {
					instance.spawnCommand('gulp', ['init']);
				}
			});
		}
	},

	_getArgs: function() {
		var args = this.args;

		if (!args) {
			args = {};

			this.args = args;
		}

		return args;
	},

	_getPrompts: function() {
		var instance = this;

		return [
			{
				default: 'My Liferay Theme',
				message: 'What would you like to call your theme?',
				name: 'themeName',
				type: 'input',
				when: instance._getWhenFn('themeName', 'name', _.isString)
			},
			{
				default: function(answers) {
					return slug((answers.themeName || '').toLowerCase());
				},
				message: 'Would you like to use this as the themeId?',
				name: 'themeId',
				type: 'input',
				when: instance._getWhenFn('themeId', 'id', _.isString)
			},
			{
				message: 'Which version of Liferay is this theme for?',
				name: 'liferayVersion',
				choices: ['7.0', '6.2'],
				type: 'list',
				when: instance._getWhenFn('liferayVersion', 'liferayVersion', instance._isLiferayVersion)
			},
			{
				message: 'What template language would you like this theme to use?',
				name: 'templateLanguage',
				choices: [
					{
						name: 'Freemarker (.ftl)',
						value: 'ftl'
					},
					{
						name: 'Velocity (.vm)',
						value: 'vm'
					}
				],
				type: 'list',
				when: instance._getWhenFn('templateLanguage', 'template', instance._isTemplateLanguage)
			},
			{
				default: false,
				message: 'Do you need Compass support? (requires Ruby and the Sass gem to be installed)',
				name: 'supportCompass',
				type: 'confirm',
				when: instance._getWhenFn('supportCompass', 'compass', _.isBoolean)
			}
		];
	},

	_getWhenFn: function(propertyName, flag, validator) {
		var instance = this;

		var args = this._getArgs();
		var argv = this.argv;

		return function() {
			var propertyValue = argv[flag];

			if (validator && propertyValue && !validator(propertyValue)) {
				propertyValue = null;

				instance.log(chalk.yellow('Warning:'), 'Invalid value set for', chalk.cyan('--' + flag));
			}

			if (propertyValue) {
				args[propertyName] = propertyValue;
			}

			return !propertyValue;
		};
	},

	_isLiferayVersion: function(value) {
		return ['6.2', '7.0'].indexOf(value) > -1;
	},

	_isTemplateLanguage: function(value) {
		return ['6.2', '7.0'].indexOf(value) > -1;
	},

	_mixArgs: function(props, args) {
		return _.assign(props, args);
	},

	_prompt: function() {
		var done = this.done;

		this.prompt(this._getPrompts(), function(props) {
			props = this._mixArgs(props, this._getArgs());

			this._promptCallback(props);

			this._track();

			done();
		}.bind(this));
	},

	_promptCallback: function(props) {
		var liferayVersion = props.liferayVersion;

		this.appname = props.themeId;
		this.liferayVersion = liferayVersion;
		this.supportCompass = props.supportCompass;
		this.templateLanguage = props.templateLanguage;
		this.themeName = props.themeName;

		this._setPublishTag(liferayVersion);
		this._setPackageVersion(liferayVersion);
	},

	_setArgv: function() {
		this.argv = minimist(process.argv.slice(2), {
			alias: {
				compass: 'c',
				id: 'i',
				liferayVersion: 'l',
				name: 'n',
				template: 't'
			},
			string: ['liferayVersion']
		});
	},

	_setPackageVersion: function(liferayVersion) {
		var packageVersion = '0.0.0';

		if (liferayVersion == '7.0') {
			packageVersion = '1.0.0';
		}

		this.packageVersion = packageVersion;
	},

	_setPublishTag: function(liferayVersion) {
		liferayVersion = liferayVersion.toString();

		this.publishTag = liferayVersion.replace('.', '_') + '_x';
	},

	_track: function() {
		var insight = this._insight;

		var liferayVersion = this.liferayVersion;

		insight.track('theme', liferayVersion);
		insight.track('theme', liferayVersion, 'templateLanguage', this.templateLanguage);
		insight.track('theme', liferayVersion, 'supportCompass', this.supportCompass);
	},

	_yosay: 'Welcome to the splendid ' + chalk.red('Liferay Theme') + ' generator!'
});