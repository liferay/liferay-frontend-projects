'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var Insight = require('insight');
var minimist = require('minimist');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');

var lookup = require('liferay-theme-tasks/lib/lookup');

module.exports = yeoman.generators.Base.extend({
	initializing() {
		var pkg = require('../../package.json');

		this.pkg = pkg;

		this._insight = new Insight({
			trackingCode: 'UA-69122110-1',
			pkg,
		});
	},

	prompting() {
		var instance = this;

		instance.done = instance.async();

		this._setArgv();

		this._setPromptDeprecationMap();

		// Have Yeoman greet the user.
		instance.log(yosay(instance._yosay));

		var insight = this._insight;

		if (_.isUndefined(insight.optOut)) {
			insight.askPermission(null, _.bind(this._prompt, this));
		} else {
			this._prompt();
		}
	},

	configuring: {
		setThemeDirName() {
			var themeDirName = this.appname;

			if (!/-theme$/.test(themeDirName)) {
				themeDirName += '-theme';
			}

			this.themeDirName = themeDirName;
		},

		enforceFolderName() {
			if (
				this.themeDirName !==
				_.last(this.destinationRoot().split(path.sep))
			) {
				this.destinationRoot(this.themeDirName);
			}

			this.config.save();
		},
	},

	writing: {
		app() {
			this.template('_package.json', 'package.json', this);

			this.fs.copy(
				this.templatePath('gitignore'),
				this.destinationPath('.gitignore')
			);

			this.template('gulpfile.js', 'gulpfile.js', this);
		},

		projectfiles() {
			this.fs.copy(
				this.templatePath('src/**'),
				this.destinationPath('src'),
				{
					globOptions: {
						ignore: this.templatePath('src/css/custom.css'),
					},
				}
			);

			var customCssName = '_custom.scss';

			this.fs.copy(
				this.templatePath('src/css/custom.css'),
				this.destinationPath('src/css/' + customCssName)
			);

			this.template(
				'src/WEB-INF/liferay-plugin-package.properties',
				'src/WEB-INF/liferay-plugin-package.properties',
				{
					liferayVersion: this.liferayVersion,
					liferayVersions: this.liferayVersion + '.0+',
					themeDisplayName: this.themeName,
				}
			);

			this.template(
				'src/WEB-INF/liferay-look-and-feel.xml',
				'src/WEB-INF/liferay-look-and-feel.xml',
				this
			);
		},
	},

	install() {
		var skipInstall = this.options['skip-install'];

		if (!skipInstall) {
			this.installDependencies({
				bower: false,
				callback() {
					const gulp = require('gulp');
					require('liferay-theme-tasks').registerTasks({
						gulp,
					});
					gulp.start('init');
				},
			});
		}
	},

	_getArgs() {
		var args = this.args;

		if (!args) {
			args = {};

			this.args = args;
		}

		return args;
	},

	_getPrompts() {
		var instance = this;

		var prompts = [
			{
				default: 'My Liferay Theme',
				message: 'What would you like to call your theme?',
				name: 'themeName',
				type: 'input',
				when: instance._getWhenFn('themeName', 'name', _.isString),
			},
			{
				default(answers) {
					return _.kebabCase(_.deburr(answers.themeName || ''));
				},
				message: 'Would you like to use this as the themeId?',
				name: 'themeId',
				type: 'input',
				when: instance._getWhenFn('themeId', 'id', _.isString),
			},
			{
				message: 'Which version of Liferay is this theme for?',
				name: 'liferayVersion',
				choices: ['7.2', '7.1', '7.0'],
				type: 'list',
				when: instance._getWhenFn(
					'liferayVersion',
					'liferayVersion',
					instance._isLiferayVersion
				),
			},
			{
				message:
					'What template language would you like this theme to use?',
				name: 'templateLanguage',
				choices: _.bind(instance._getTemplateLanguageChoices, instance),
				type: 'list',
				when: instance._getWhenFn(
					'templateLanguage',
					'template',
					instance._isTemplateLanguage
				),
			},
		];

		return prompts;
	},

	_getTemplateLanguageChoices: answers =>
		lookup('template:choices', answers.liferayVersion),

	_getWhenFn(propertyName, flag, validator) {
		var instance = this;

		var args = this._getArgs();
		var argv = this.argv;

		var deprecated = argv.deprecated;
		var promptDeprecationMap = this.promptDeprecationMap;

		return function(answers) {
			var propertyValue = argv[flag];

			var liferayVersion = answers.liferayVersion || argv.liferayVersion;

			if (
				(!answers.liferayVersion || !args.liferayVersion) &&
				argv.liferayVersion
			) {
				answers.liferayVersion = args.liferayVersion = liferayVersion;
			}

			if (
				validator &&
				instance._isDefined(propertyValue) &&
				!validator(propertyValue, answers)
			) {
				propertyValue = null;

				instance.log(
					chalk.yellow('Warning:'),
					'Invalid value set for',
					chalk.cyan('--' + flag)
				);
			}

			var ask = true;
			var propertyDefined = instance._isDefined(propertyValue);

			if (propertyDefined) {
				args[propertyName] = propertyValue;

				ask = false;
			} else if (promptDeprecationMap) {
				var deprecatedVersions = promptDeprecationMap[propertyName];

				ask = !deprecatedVersions;

				if (
					deprecated &&
					deprecatedVersions &&
					deprecatedVersions.indexOf(liferayVersion) > -1
				) {
					ask = true;
				}
			}

			return ask;
		};
	},

	_isDefined(value) {
		return !_.isUndefined(value) && !_.isNull(value);
	},

	_isLiferayVersion(value) {
		return ['7.2', '7.1', '7.0'].indexOf(value) > -1;
	},

	_isTemplateLanguage: (value, answers) =>
		lookup('template:isLanguage', answers.liferayVersion)(value),

	_mixArgs(props, args) {
		return _.assign(props, args);
	},

	_printWarnings(props) {
		lookup('template:printWarnings', props.liferayVersion)(this, props);
	},

	_prompt() {
		var done = this.done;

		this.prompt(
			this._getPrompts(),
			function(props) {
				props = this._mixArgs(props, this._getArgs());

				this._promptCallback(props);

				this._track();

				done();
			}.bind(this)
		);
	},

	_promptCallback(props) {
		var liferayVersion = props.liferayVersion;

		this.appname = props.themeId;
		this.devDependencies = JSON.stringify(
			lookup('devDependencies', liferayVersion),
			null,
			2
		)
			.split(/\n\s*/)
			.join('\n\t\t')
			.replace('\t\t}', '\t}');
		this.liferayVersion = liferayVersion;
		this.templateLanguage = props.templateLanguage;
		this.themeName = props.themeName;

		this._setDefaults(liferayVersion);

		this._printWarnings(props);

		this._setPackageVersion();
	},

	_setArgv() {
		this.argv = minimist(process.argv.slice(2), {
			alias: {
				id: 'i',
				liferayVersion: 'l',
				name: 'n',
				template: 't',
			},
			string: ['liferayVersion'],
		});
	},

	_setDefaults(_liferayVersion) {
		_.defaults(this, {
			templateLanguage: 'ftl',
		});
	},

	_setPackageVersion() {
		this.packageVersion = '1.0.0';
	},

	_setPromptDeprecationMap() {
		this.promptDeprecationMap = {
			templateLanguage: ['7.0'],
		};
	},

	_track() {
		var insight = this._insight;

		var liferayVersion = this.liferayVersion;

		insight.track('theme', liferayVersion);
		insight.track(
			'theme',
			liferayVersion,
			'templateLanguage',
			this.templateLanguage
		);
	},

	_yosay:
		'Welcome to the splendid ' + chalk.red('Liferay Theme') + ' generator!',
});
