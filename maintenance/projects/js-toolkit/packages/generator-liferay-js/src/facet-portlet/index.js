/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import Generator from 'yeoman-generator';

import {Copier, getPortletName, promptWithConfig} from '../utils';
import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import LanguagePropertiesModifier from '../utils/modifier/features/localization/Language.properties';
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
				message: 'Under which category should your widget be listed?',
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
		const projectAnalyzer = new ProjectAnalyzer(this);

		const portletName = getPortletName(projectAnalyzer);
		const portletDisplayName = projectAnalyzer.displayName;

		// Require extender

		npmbundlerrc.setFeature('js-extender', true);

		// Copy static assets

		cp.copyDir('assets');

		// Add portlet properties

		pkgJson.addPortletProperty(
			'com.liferay.portlet.display-category',
			this.answers.category
		);
		pkgJson.addPortletProperty(
			'com.liferay.portlet.header-portlet-css',
			'/css/styles.css'
		);
		pkgJson.addPortletProperty('com.liferay.portlet.instanceable', true);
		pkgJson.addPortletProperty('javax.portlet.name', portletName);
		pkgJson.addPortletProperty(
			'javax.portlet.security-role-ref',
			'power-user,user'
		);

		// Add portlet display name as needed

		if (projectAnalyzer.hasLocalization) {

			// Add resource bundle portlet property

			pkgJson.addPortletProperty(
				'javax.portlet.resource-bundle',
				`content.${projectAnalyzer.localizationBundleName}`
			);

			// Add portlet display name localization key

			new LanguagePropertiesModifier(this).addProperty(
				`javax.portlet.title.${portletName}`,
				portletDisplayName
			);
		}
		else {
			pkgJson.addPortletProperty(
				'javax.portlet.display-name',
				portletDisplayName
			);
		}
	}
}

module.exports = exports['default'];
