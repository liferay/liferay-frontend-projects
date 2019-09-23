/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');
const devDependencies = require('liferay-theme-tasks/lib/devDependencies');
const minimist = require('minimist');
const path = require('path');

const LayoutCreator = require('../../lib/layout_creator');
const Base = require('../app');
const isString = require('../common/isString');
const normalizeName = require('../common/normalizeName');
const splitWords = require('../common/splitWords');

/**
 * Returns a "snake case" version of `name` (eg. "foo_bar_baz").
 */
function snakeCase(name) {
	return splitWords(name)
		.join('_')
		.toLowerCase();
}

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

		const pathComponents = this.destinationRoot().split(path.sep);
		const last = pathComponents[pathComponents.length - 1];
		if (this.layoutDirName !== last) {
			let layoutDirName = this.layoutDirName;

			const themePackagePath = path.join(process.cwd(), 'package.json');

			fs.stat(themePackagePath, (err, stat) => {
				if (!err && stat.isFile()) {
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
		} else {
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
		} else {
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

			new LayoutCreator({
				after(templateContent) {
					instance.fs.write(templateDestination, templateContent);

					done();
				},
				className: this.layoutId,
				liferayVersion: this.liferayVersion,
			});
		}
	}

	install() {
		const skipInstall = this.options['skip-install'];

		if (!skipInstall) {
			this.on('npmInstall:end', () => {
				const gulp = require('gulp');
				require('liferay-theme-tasks/plugin').registerTasks({
					gulp,
				});
				gulp.start('init');
			});

			this.installDependencies({bower: false});
		}
	}

	_getPrompts() {
		const instance = this;

		return [
			{
				default: 'My Liferay Layout',
				message: 'What would you like to call your layout template?',
				name: 'layoutName',
				type: 'input',
				when: instance._getWhenFn('layoutName', 'name', isString),
			},
			{
				default(answers) {
					return normalizeName(answers.layoutName || '');
				},
				message:
					'Would you like to use this as the layout template id?',
				name: 'layoutId',
				type: 'input',
				when: instance._getWhenFn('layoutId', 'id', isString),
			},
			{
				choices: ['7.2'],
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
		const liferayVersion = props.liferayVersion;

		this.layoutId = layoutId;
		this.layoutName = props.layoutName;
		this.liferayVersion = liferayVersion;
		this.tasksVersion = devDependencies.default['liferay-theme-tasks'];
		this.templateFilename = snakeCase(layoutId) + '.ftl';
		this.themeLayout = false;
		this.thumbnailFilename = snakeCase(layoutId) + '.png';

		this._setPackageVersion(this.liferayVersion);
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
