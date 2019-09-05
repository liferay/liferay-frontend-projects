/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	info,
	error,
	print,
	success,
	title,
	warn,
} from 'liferay-npm-build-tools-common/lib/format';
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
	checkForYarn: [
		info`
		Checking for Yarn... 
		`,
	],
	createReactAppDetected: [
		success`
		We have detected a project of type {create-react-app}
		`,
	],
	projectAdapted: [
		``,
		success`
		Your project has been successfully adapted to {Liferay JS Toolkit}.
		`,
		info`
		See http://bit.ly/js-toolkit-wiki for the full list of {npm} scripts 
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
		Please visit http://bit.ly/js-toolkit-wiki for the full list of 
		supported project types and how they are detected.
		`,
	],
	useNpm: [
		info`
		NPM will be used.
		`,
	],
	useYarn: [
		info`
		Yarn will be used.
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
	yarnNotFound: [
		warn`
		Yarn was not found on this machine. 
		`,
	],
};

/**
 * Generator to add deploy support to projects.
 */
export default class extends Generator {
	/**
	 * Standard Yeoman constructor
	 */
	constructor(args, opts) {
		super(args, opts);

		// This method adds support for a `--use-npm` flag (to override yarn usage where both exist)
		this.option('use-npm');

		// Make it available to access later
		this.useYarn = this.options['use-npm'] ? false : true;
	}
	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));

		print(msg.welcome);

		switch (project.probe.type) {
			case project.probe.TYPE_CREATE_REACT_APP:
				print(msg.createReactAppDetected);
				this._tuneProject = () => this._tuneCreateReactAppProject();
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
		this._tuneProject();
	}

	/**
	 * Standard Yeoman install function
	 */
	install() {
		print(msg.projectAdapted);

		if (this.useYarn) {
			print(msg.checkForYarn);
			const yarnVersionResult = this.spawnCommandSync(
				'yarnpkg',
				['--version'],
				{stdio: [process.stderr]}
			);

			// If version check had any error, assume that we can't actually use Yarn
			if (yarnVersionResult.error !== null) {
				this.useYarn = false;
				print(msg.yarnNotFound);
				print(msg.useNpm);
			} else {
				print(msg.useYarn);
			}
		} else {
			print(msg.useNpm);
		}

		this.installDependencies({
			bower: false,
			npm: !this.useYarn,
			yarn: this.useYarn,
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
		const portletName = getPortletName(projectAnalyzer);

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

		// Add npm scripts
		pkgJson.addScript('build:liferay', 'lnbs-build');
		pkgJson.addScript(
			'deploy:liferay',
			(this.useYarn ? 'yarn' : 'npm') +
				' run build:liferay && lnbs-deploy'
		);

		// Add portlet section
		pkgJson.addPortletProperty(
			'com.liferay.portlet.display-category',
			this.answers.category
		);
		pkgJson.addPortletProperty('com.liferay.portlet.instanceable', true);
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

	_tuneCreateReactAppProject() {
		const npmbundlerrc = new NpmbundlerrcModifier(this);
		const pkgJson = new PkgJsonModifier(this, 2);

		npmbundlerrc.setPreset('liferay-npm-bundler-preset-create-react-app');

		pkgJson.addDevDependency(
			'liferay-npm-bundler-preset-create-react-app',
			getSDKVersion('liferay-npm-bundler-preset-create-react-app', {
				ignoreConfig: true,
			})
		);
	}
}
