'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var fs = require('fs');
var LayoutCreator = require('../../lib/layout_creator');
var minimist = require('minimist');
var path = require('path');
var yeoman = require('yeoman-generator');

var liferayThemeGeneratorPrototype = _.cloneDeep(require('../app/index').prototype);

var initializing = liferayThemeGeneratorPrototype.initializing;

var layoutGeneratorPrototype = _.merge(liferayThemeGeneratorPrototype, {
	configuring: {
		setThemeDirName: function() {
			var layoutDirName = this.layoutId;

			if (!(/-layouttpl$/.test(layoutDirName))) {
				layoutDirName += '-layouttpl';
			}

			this.layoutDirName = layoutDirName;
		},

		enforceFolderName: function() {
			var instance = this;

			var done = this.async();

			instance.rootDir = instance.destinationRoot();

			if (this.layoutDirName !== _.last(this.destinationRoot().split(path.sep))) {
				var layoutDirName = this.layoutDirName;

				var themePackagePath = path.join(process.cwd(), 'package.json');

				fs.stat(themePackagePath, function(err, stat) {
					if (!err && stat.isFile()) {
						var themePackage = require(themePackagePath);

						if (themePackage.liferayTheme) {
							layoutDirName = path.join('src/layouttpl/custom', layoutDirName);

							instance.themeLayout = true;
						}
					}

					instance.destinationRoot(layoutDirName);

					instance.config.save();

					done();
				});
			}
			else {
				done();
			}
		}
	},

	writing: function() {
		var instance = this;

		var thumbnailDestination = this.themeLayout ? this.thumbnailFilename : path.join('docroot', this.thumbnailFilename);
		var templateDestination = this.themeLayout ? this.templateFilename : path.join('docroot', this.templateFilename);

		var xmlDestination = 'docroot/WEB-INF/liferay-layout-templates.xml';

		this.templateDestination = '';

		this.fs.copy(this.templatePath('docroot/layout.png'), this.destinationPath(thumbnailDestination));
		this.template('docroot/layout.tpl', templateDestination, this);

		if (!this.themeLayout) {
			this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));
			this.template('_package.json', 'package.json', this);
			this.template('docroot/WEB-INF/liferay-plugin-package.properties', 'docroot/WEB-INF/liferay-plugin-package.properties', this);
			this.template('gulpfile.js', 'gulpfile.js', this);
		}
		else {
			this.templateDestination = path.join('/layouttpl/custom/', this.layoutDirName);

			xmlDestination = path.join(instance.rootDir, 'src/WEB-INF/liferay-layout-templates.xml');
		}

		this.template('docroot/WEB-INF/liferay-layout-templates.xml', xmlDestination, this);

		if (!this.options['skip-creation']) {
			var done = this.async();

			new LayoutCreator({
				after: function(templateContent) {
					instance.fs.write(templateDestination, templateContent);

					done();
				},
				className: this.layoutId,
				liferayVersion: this.liferayVersion
			});
		}
	},

	_getPrompts: function() {
		var instance = this;

		return [
			{
				default: 'My Liferay Layout',
				message: 'What would you like to call your layout template?',
				name: 'layoutName',
				type: 'input',
				when: instance._getWhenFn('layoutName', 'name', _.isString)
			},
			{
				default: function(answers) {
					return _.kebabCase(_.deburr(answers.layoutName || ''));
				},
				message: 'Would you like to use this as the layout template id?',
				name: 'layoutId',
				type: 'input',
				when: instance._getWhenFn('layoutId', 'id', _.isString)
			},
			{
				message: 'Which version of Liferay is this layout template for?',
				name: 'liferayVersion',
				choices: ['7.1', '7.0'],
				type: 'list',
				when: instance._getWhenFn('liferayVersion', 'liferayVersion', instance._isLiferayVersion)
			}
		];
	},

	_promptCallback: function(props) {
		var layoutId = props.layoutId;

		this.layoutId = layoutId;
		this.layoutName = props.layoutName;
		this.liferayVersion = props.liferayVersion;
		this.templateFilename = _.snakeCase(layoutId) + '.tpl';
		this.themeLayout = false;
		this.thumbnailFilename = _.snakeCase(layoutId) + '.png';

		this._setPackageVersion(this.liferayVersion);
	},

	_setArgv: function() {
		this.argv = minimist(process.argv.slice(2), {
			alias: {
				id: 'i',
				liferayVersion: 'l',
				name: 'n'
			},
			string: ['liferayVersion']
		});
	},

	_track: function() {
		this._insight.track('layout', this.liferayVersion);
	},

	_yosay: 'Welcome to the splendid ' + chalk.red('Liferay Layout Template') + ' generator!'
});

module.exports = yeoman.generators.Base.extend(layoutGeneratorPrototype);
