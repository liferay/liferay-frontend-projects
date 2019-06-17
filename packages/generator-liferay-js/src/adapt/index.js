/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import Generator from 'yeoman-generator';

import {
	Copier,
	getPortletName,
	getSDKVersion,
	promptWithConfig,
	validateLiferayDir,
} from '../utils';
import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import GitignoreModifier from '../utils/modifier/gitignore';
import NpmbundlerrcModifier from '../utils/modifier/npmbundlerrc';
import NpmbuildrcModifier from '../utils/modifier/npmbuildrc';
import PkgJsonModifier from '../utils/modifier/package.json';
import LanguagePropertiesModifier from '../utils/modifier/features/localization/Language.properties';

const msg = {
	createReactAppDetected:
		"Looks like your project was created with 'create-react-app'.",
	warnAboutOverwrite:
		'\n' +
		'Now, your project files will be modified. As a consequence, Yeoman\n' +
		'may notify you about the existence of a conflict and prompt for \n' +
		'permission to overwrite your files.\n' +
		'\n' +
		"Make sure to answer 'a' or otherwise the adaptation to Liferay\n" +
		'will fail.\n' +
		'\n' +
		'Note that you can also avoid this conflict warning providing\n' +
		"the '--force' argument to Yeoman.\n",
	questions:
		'It will be tuned accordingly, so that you can deploy it to\n' +
		'Liferay DXP or Liferay Portal CE.\n' +
		'\n' +
		'But first we need you to answer some customization questions...\n',
	welcome:
		'\n' + 'Welcome to Liferay JavaScript Toolkit project adapter 👋\n',
	unsupportedProjectType:
		'\n' +
		'Oops!\n' +
		'\n' +
		'Your project type is not supported by Liferay JS Toolkit or cannot\n' +
		'cannot be autodetected.\n' +
		'\n' +
		'Please visit http://bit.ly/js-toolkit-wiki for the full list of\n' +
		'supported project types and how they are detected.\n',
};

/**
 * Generator to add deploy support to projects.
 */
export default class extends Generator {
	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));

		console.log(msg.welcome);

		switch (project.probe.type) {
			case project.probe.TYPE_CREATE_REACT_APP:
				console.log(msg.createReactAppDetected);
				this._tuneProject = () => this._tuneCreateReactAppProject();
				break;

			default:
				console.error(msg.unsupportedProjectType);
				process.exit(1);
		}
	}

	/**
	 * Standard Yeoman prompt function
	 */
	async prompting() {
		console.log(msg.questions);

		const answers = await promptWithConfig(this, 'adapt', [
			{
				type: 'confirm',
				name: 'liferayPresent',
				message:
					'Do you have a local installation of Liferay for development?',
				default: true,
			},
		]);

		if (!answers.liferayPresent) {
			this.answers = {};

			return;
		}

		this.answers = await promptWithConfig(this, 'adapt', [
			{
				type: 'input',
				name: 'liferayDir',
				message: 'Where is your local installation of Liferay placed?',
				default: '/liferay',
				validate: validateLiferayDir,
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		console.log(msg.warnAboutOverwrite);

		this._copyTemplates();
		this._modifyTemplates();
		this._tuneProject();
	}

	/**
	 * Standard Yeoman install function
	 */
	install() {
		this.installDependencies({
			bower: false,
		});
	}

	_copyTemplates() {
		const cp = new Copier(this);

		cp.copyDir('.');
	}

	_modifyTemplates() {
		const gitignore = new GitignoreModifier(this);
		const languagePropertiesModifier = new LanguagePropertiesModifier(this);
		const npmbuildrc = new NpmbuildrcModifier(this);
		const pkgJson = new PkgJsonModifier(this, 2);
		const projectAnalyzer = new ProjectAnalyzer(this);

		// Git ignore build.lr directory
		gitignore.add('build.lr');

		// Configure deploy target
		if (this.answers.liferayDir) {
			npmbuildrc.setLiferayDir(this.answers.liferayDir);
		}

		// Add JS toolkit dependencies
		pkgJson.addDevDependency(
			'liferay-npm-build-support',
			getSDKVersion('liferay-npm-build-support')
		);
		pkgJson.addDevDependency(
			'liferay-npm-bundler',
			getSDKVersion('liferay-npm-bundler')
		);

		// Add npm scripts
		pkgJson.addScript('lr:build', 'lnbs-build');
		pkgJson.addScript('lr:deploy', 'npm run lr:build && lnbs-deploy');

		// Add portlet section
		pkgJson.addPortletProperty(
			'com.liferay.portlet.display-category',
			'Adapted Widgets'
		);
		pkgJson.addPortletProperty(
			'javax.portlet.security-role-ref',
			'power-user,user'
		);
		pkgJson.addPortletProperty(
			'javax.portlet.resource-bundle',
			'content.Language'
		);

		// Add localization key for portlet name
		languagePropertiesModifier.addProperty(
			`javax.portlet.title.${getPortletName(projectAnalyzer)}`,
			projectAnalyzer.displayName
		);
	}

	_tuneCreateReactAppProject() {
		const npmbundlerrc = new NpmbundlerrcModifier(this);
		const pkgJson = new PkgJsonModifier(this, 2);

		npmbundlerrc.setPreset('liferay-npm-bundler-preset-create-react-app');

		pkgJson.addDevDependency(
			'liferay-npm-bundler-preset-create-react-app',
			getSDKVersion('liferay-npm-bundler-preset-create-react-app')
		);
	}
}
