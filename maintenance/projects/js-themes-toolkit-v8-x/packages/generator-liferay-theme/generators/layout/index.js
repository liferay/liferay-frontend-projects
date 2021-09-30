/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');
const _ = require('lodash');
const minimist = require('minimist');
const path = require('path');

const LayoutCreator = require('../../lib/layout_creator');
const config = require('../../lib/utils/config');
const Base = require('../app');

module.exports = class extends Base {
	initializing() {
		super.initializing();
	}

	prompting() {
		super.prompting();
	}

	_setThemeDirName() {
		let layoutDirName = this.layoutId;

		if (!/-layouttpl$/.test(layoutDirName)) {
			layoutDirName += '-layouttpl';
		}

		this.layoutDirName = layoutDirName;
	}

	_enforceFolderName() {
		const instance = this;
		const done = this.async();

		instance.rootDir = instance.destinationRoot();

		if (
			this.layoutDirName !==
			_.last(this.destinationRoot().split(path.sep))
		) {
			let layoutDirName = this.layoutDirName;

			const themePackagePath = path.join(process.cwd(), 'package.json');

			fs.stat(themePackagePath, (err, stat) => {
				if (!err && stat.isFile()) {
					// eslint-disable-next-line @liferay/no-dynamic-require
					const themePackage = require(themePackagePath);

					if (themePackage.liferayTheme) {
						layoutDirName = path.join(
							'src/layouttpl/custom',
							layoutDirName
						);

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

	configuring() {
		this._setThemeDirName();
		this._enforceFolderName();
	}

	writing() {
		const instance = this;

		const thumbnailDestination = this.themeLayout
			? this.thumbnailFilename
			: path.join('docroot', this.thumbnailFilename);
		const templateDestination = this.themeLayout
			? this.templateFilename
			: path.join('docroot', this.templateFilename);

		let xmlDestination = 'docroot/WEB-INF/liferay-layout-templates.xml';

		this.templateDestination = '';

		this.fs.copy(
			this.templatePath('docroot/layout.png'),
			this.destinationPath(thumbnailDestination)
		);
		this.fs.copyTpl(
			this.templatePath('docroot/layout.ftl'),
			this.destinationPath(templateDestination),
			this
		);

		if (!this.themeLayout) {
			this.fs.copy(
				this.templatePath('gitignore'),
				this.destinationPath('.gitignore')
			);
			this.fs.copyTpl(
				this.templatePath('_package.json'),
				this.destinationPath('package.json'),
				this
			);
			this.fs.copyTpl(
				this.templatePath(
					'docroot/WEB-INF/liferay-plugin-package.properties'
				),
				this.destinationPath(
					'docroot/WEB-INF/liferay-plugin-package.properties'
				),
				this
			);
			this.fs.copyTpl(
				this.templatePath('gulpfile.js'),
				this.destinationPath('gulpfile.js'),
				this
			);
		}
		else {
			this.templateDestination = path.join(
				'/layouttpl/custom/',
				this.layoutDirName
			);

			xmlDestination = path.join(
				instance.rootDir,
				'src/WEB-INF/liferay-layout-templates.xml'
			);
		}

		this.fs.copyTpl(
			this.templatePath('docroot/WEB-INF/liferay-layout-templates.xml'),
			this.destinationPath(xmlDestination),
			this
		);

		if (!this.options['skip-creation']) {
			const done = this.async();

			const options = {
				className: this.layoutId,
				liferayVersion: this.liferayVersion,
			};

			if (config.batchMode()) {
				options.rowData = [
					[
						{
							className: 'portlet-column-only',
							contentClassName: 'portlet-column-content-only',
							number: 1,
							size: 12,
						},
					],
				];
			}

			new LayoutCreator({
				after(templateContent) {
					instance.fs.write(templateDestination, templateContent);

					done();
				},
				...options,
			});
		}
	}

	install() {
		const skipInstall = this.options['skip-install'];

		if (!skipInstall) {
			this.on('npmInstall:end', () => {
				if (config.batchMode()) {
					this._runBatchGulpInit();
				}
				else {
					this._runGulpInit();
				}
			});

			this.installDependencies({bower: false});
		}
	}

	_getPromptNamespace() {
		return 'layout';
	}

	_getPrompts() {
		const instance = this;

		return [
			{
				default: 'My Liferay Layout',
				message: 'What would you like to call your layout template?',
				name: 'layoutName',
				type: 'input',
				when: instance._getWhenFn('layoutName', 'name', _.isString),
			},
			{
				default(answers) {
					return _.kebabCase(_.deburr(answers.layoutName || ''));
				},
				message:
					'Would you like to use this as the layout template id?',
				name: 'layoutId',
				type: 'input',
				when: instance._getWhenFn('layoutId', 'id', _.isString),
			},
			{
				choices: ['7.1', '7.0'],
				default: '7.1',
				message:
					'Which version of Liferay is this layout template for?',
				name: 'liferayVersion',
				type: 'list',
				when: instance._getWhenFn(
					'liferayVersion',
					'liferayVersion',
					instance._isLiferayVersion
				),
			},
		];
	}

	_promptCallback(props) {
		const layoutId = props.layoutId;

		this.layoutId = layoutId;
		this.layoutName = props.layoutName;
		this.liferayVersion = props.liferayVersion;
		this.templateFilename = _.snakeCase(layoutId) + '.ftl';
		this.themeLayout = false;
		this.thumbnailFilename = _.snakeCase(layoutId) + '.png';

		this._setPackageVersion(this.liferayVersion);
	}

	_runBatchGulpInit() {
		const answers = {
			deployed: false,
			pluginName: path.basename(process.cwd()),
		};

		answers.deploymentStrategy = config.getDefaultAnswer(
			'init',
			'deploymentStrategy',
			'LocalAppServer'
		);
		answers.appServerPath = config.getDefaultAnswer(
			'init',
			'appServerPath',
			path.join(path.dirname(process.cwd()), 'tomcat')
		);
		answers.deployPath = config.getDefaultAnswer(
			'init',
			'deployPath',
			path.join(answers.appServerPath, '..', 'deploy')
		);
		answers.url = config.getDefaultAnswer(
			'init',
			'url',
			'http://localhost:8080'
		);

		if (answers.deploymentStrategy === 'DockerContainer') {
			answers.dockerContainerName = config.getDefaultAnswer(
				'init',
				'dockerContainerName',
				'liferay_portal_1'
			);

			answers.appServerPathPlugin = path.posix.join(
				answers.appServerPath,
				'webapps',
				answers.pluginName
			);
		}
		else {
			answers.appServerPathPlugin = path.join(
				answers.appServerPath,
				'webapps',
				answers.pluginName
			);
		}

		fs.writeFileSync(
			'liferay-plugin.json',
			JSON.stringify({LiferayPlugin: answers}, null, 2)
		);
	}

	_runGulpInit() {
		const gulp = require('gulp');

		process.argv = process.argv.slice(0, 2).concat(['init']);

		require('liferay-plugin-node-tasks').registerTasks({gulp});
		gulp.start('init');
	}

	_setArgv() {
		this.argv = minimist(process.argv.slice(2), {
			alias: {
				id: 'i',
				liferayVersion: 'l',
				name: 'n',
			},
			string: ['liferayVersion'],
		});
	}

	_track() {
		this._insight.track('layout', this.liferayVersion);
	}
};
