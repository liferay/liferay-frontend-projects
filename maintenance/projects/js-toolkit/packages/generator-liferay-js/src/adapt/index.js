/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	error,
	info,
	print,
	success,
	title,
	warn,
} from 'liferay-npm-build-tools-common/lib/format';
import project from 'liferay-npm-build-tools-common/lib/project';
import {ProjectType} from 'liferay-npm-build-tools-common/lib/project/probe';
import path from 'path';
import {argv} from 'yargs';
import Generator from 'yeoman-generator';

import {
	Copier,
	getPortletName,
	getSDKVersion,
	promptWithConfig,
	validateLiferayDir,
	warnAboutLiferayCli,
} from '../utils';
import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import LanguagePropertiesModifier from '../utils/modifier/features/localization/Language.properties';
import GitignoreModifier from '../utils/modifier/gitignore';
import NpmbuildrcModifier from '../utils/modifier/npmbuildrc';
import NpmbundlerrcModifier from '../utils/modifier/npmbundlerrc';
import PkgJsonModifier from '../utils/modifier/package.json';

const msg = {
	angularCliDetected: [
		success`
		We have detected a project of type {angular-cli}
		`,
	],
	createReactAppDetected: [
		success`
		We have detected a project of type {create-react-app}
		`,
	],
	vueCliDetected: [
		success`
		We have detected a project of type {vue-cli}
		`,
	],
	projectAdapted: [
		``,
		success`
		Your project has been successfully adapted to {Liferay JS Toolkit}.
		`,
		info`
		See http://bit.ly/js-toolkit-adapt for the full list of {npm} scripts 
		that may be used in your newly adapted project.
		
		Nevertheless, you can start with {'npm run deploy:liferay'} to deploy it
		to your Liferay server.
		`,
	],
	questions: `
		It will be tuned accordingly, so that you can deploy it to your Liferay
		server.

		But first we need you to answer some customization questions...
		`,
	unsupportedProjectType: [
		error`
		Oops! Your project type is not supported by {Liferay JS Toolkit} or 
		cannot be autodetected.
		`,
		info`
		Please visit http://bit.ly/js-toolkit-adapt for the full list of 
		supported project types and how they are detected.
		`,
	],
	warnAboutOverwrite: [
		'',
		warn`
		Now your project files will be modified. As a consequence, {Yeoman} may
		notify you about the existence of a conflict and prompt for permission 
		to overwrite your files.

		Make sure to answer {'a'} or otherwise the adaptation to {Liferay JS 
		Toolkit} will fail.
		`,
		info`
		Note that you can also avoid this conflict warning providing the 
		{'--force'} argument to Yeoman.
		`,
	],
	welcome: [
		title`
		
		|👋 |Welcome to Liferay JS Toolkit project adapter 
		`,
	],
};

// If --which parameter is given show path to generator and exit

if (argv.which) {
	console.log(require.resolve('./index'));
	process.exit(0);
}

/**
 * Generator to add deploy support to projects.
 */
export default class extends Generator {

	/**
	 * Standard Yeoman constructor
	 */
	constructor(args, opts) {
		super(args, opts);
	}

	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));

		warnAboutLiferayCli();

		print(msg.welcome);

		switch (project.probe.type) {
			case ProjectType.ANGULAR_CLI:
				this._options = {
					preset: 'angular-cli',
					tuneProject: () => this._tuneAngularCliProject(),
				};

				print(msg.angularCliDetected);
				break;

			case ProjectType.CREATE_REACT_APP:
				this._options = {
					preset: 'create-react-app',
					tuneProject: () => this._tuneCreateReactAppProject(),
				};

				print(msg.createReactAppDetected);
				break;

			case ProjectType.VUE_CLI:
				this._options = {
					preset: 'vue-cli',
					tuneProject: () => this._tuneVueCliProject(),
				};

				print(msg.vueCliDetected);
				break;

			default:
				print(msg.unsupportedProjectType);
				process.exit(1);
		}
	}

	/**
	 * Standard Yeoman prompt function
	 */
	async prompting() {
		print(msg.questions);

		this.answers = {};

		if (project.pkgManager === null) {
			const answers = await promptWithConfig(this, 'adapt', [
				{
					type: 'list',
					name: 'pkgManager',
					message:
						'Which package manager are you using for the project?',
					default: 'npm',
					choices: [
						{name: 'npm', value: 'npm'},
						{name: 'yarn', value: 'yarn'},
					],
				},
			]);

			// Set project's package manager internally using a hack

			project._pkgManager = answers.pkgManager;
		}

		Object.assign(
			this.answers,
			await promptWithConfig(this, 'adapt', [
				{
					type: 'input',
					name: 'category',
					message:
						'Under which category should your widget be listed?',
					default: 'category.sample',
				},
			])
		);

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
			return;
		}

		Object.assign(
			this.answers,
			await promptWithConfig(this, 'adapt', [
				{
					type: 'input',
					name: 'liferayDir',
					message:
						'Where is your local installation of Liferay placed?',
					default: '/liferay',
					validate: validateLiferayDir,
				},
			])
		);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		print(msg.warnAboutOverwrite);

		this._copyTemplates();
		this._modifyTemplates();
		this._options.tuneProject();
	}

	/**
	 * Standard Yeoman install function
	 */
	install() {
		print(msg.projectAdapted);

		const opts = {
			bower: false,
			npm: false,
			yarn: false,
			skipMessage: this.options['skip-install-message'],
			skipInstall: this.options['skip-install'],
		};

		opts[project.pkgManager] = true;

		this.installDependencies(opts);
	}

	_copyTemplates() {
		const cp = new Copier(this);

		cp.copyDir('.');
	}

	_modifyTemplates() {
		const gitignore = new GitignoreModifier(this);
		const languagePropertiesModifier = new LanguagePropertiesModifier(this);
		const npmbuildrc = new NpmbuildrcModifier(this);
		const npmbundlerrc = new NpmbundlerrcModifier(this);
		const pkgJson = new PkgJsonModifier(this, 2);
		const projectAnalyzer = new ProjectAnalyzer(this);
		const portletName = getPortletName(projectAnalyzer);

		const {preset} = this._options;

		// Git ignore build.liferay directory

		gitignore.add('build.liferay');

		// Configure deploy target

		if (this.answers.liferayDir) {
			npmbuildrc.setLiferayDir(this.answers.liferayDir);
		}

		// Add JS toolkit dependencies

		pkgJson.addDevDependency(
			'liferay-npm-build-support',
			getSDKVersion('liferay-npm-build-support', {ignoreConfig: true})
		);
		pkgJson.addDevDependency(
			'liferay-npm-bundler',
			getSDKVersion('liferay-npm-bundler', {ignoreConfig: true})
		);
		pkgJson.addDevDependency(
			`liferay-npm-bundler-preset-${preset}`,
			getSDKVersion(`liferay-npm-bundler-preset-${preset}`, {
				ignoreConfig: true,
			})
		);

		// Configure preset

		npmbundlerrc.setPreset(`liferay-npm-bundler-preset-${preset}`);

		// Add npm scripts

		pkgJson.addScript('build:liferay', 'lnbs-build');
		pkgJson.addScript(
			'deploy:liferay',
			`${project.pkgManager} run build:liferay && lnbs-deploy`
		);

		// Add portlet section

		pkgJson.addPortletProperty(
			'com.liferay.portlet.display-category',
			this.answers.category
		);
		pkgJson.addPortletProperty('javax.portlet.name', portletName);
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
			`javax.portlet.title.${portletName}`,
			projectAnalyzer.displayName
		);
	}

	_tuneAngularCliProject() {
		const pkgJson = new PkgJsonModifier(this, 2);
		const projectAnalyzer = new ProjectAnalyzer(this);

		pkgJson.addPortletProperty('com.liferay.portlet.instanceable', false);
		pkgJson.addPortletProperty(
			'com.liferay.portlet.header-portlet-css',
			`/${projectAnalyzer.name}/styles.css`
		);
	}

	_tuneCreateReactAppProject() {
		const pkgJson = new PkgJsonModifier(this, 2);

		pkgJson.addPortletProperty('com.liferay.portlet.instanceable', true);
	}

	_tuneVueCliProject() {
		const pkgJson = new PkgJsonModifier(this, 2);

		pkgJson.addPortletProperty('com.liferay.portlet.instanceable', true);
	}
}

module.exports = exports['default'];
