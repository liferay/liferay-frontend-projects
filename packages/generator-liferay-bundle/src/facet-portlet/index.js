import path from 'path';
import Generator from 'yeoman-generator';

import {promptWithConfig} from '../utils';
import {Copier} from '../utils';
import NpmbundlerrcModifier from '../utils/modifier/npmbundlerrc';
import PkgJsonModifier from '../utils/modifier/package.json';

/**
 * Generator to add portlet support to projects.
 */
export default class extends Generator {
	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
	}

	/**
	 * Standard Yeoman prompt function
	 */
	async prompting() {
		this.answers = await promptWithConfig(this, 'facet-portlet', [
			{
				type: 'input',
				name: 'category',
				message: 'Under which category should your portlet be listed?',
				default: 'category.sample',
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		const cp = new Copier(this);
		const npmbundlerrc = new NpmbundlerrcModifier(this);
		const pkgJson = new PkgJsonModifier(this);

		npmbundlerrc.setFeature('js-extender', true);

		pkgJson.addPortletProperty(
			'javax.portlet.display-name',
			pkgJson.json.description || ''
		);
		pkgJson.addPortletProperty(
			'javax.portlet.security-role-ref',
			'power-user,user'
		);
		pkgJson.addPortletProperty('com.liferay.portlet.instanceable', true);
		pkgJson.addPortletProperty(
			'com.liferay.portlet.display-category',
			this.answers.category
		);
		pkgJson.addPortletProperty(
			'com.liferay.portlet.header-portlet-css',
			'/css/styles.css'
		);

		cp.copyDir('assets');
	}
}
