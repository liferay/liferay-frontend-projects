/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	TRANSFORM_OPERATIONS,
	TemplateRenderer,
	format,
	transformJsonFile,
	transformTextFile,
} from '@liferay/js-toolkit-core';

import ensureOutputFile from '../../util/ensureOutputFile';
import getPortletName from '../../util/getPortletName';
import prompt from '../../util/prompt';
import toHumanReadable from '../../util/toHumanReadable';

import type {Facet, Options} from '../index';

const {
	PkgJson: {addPortletProperties},
	Text: {appendLines},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const facet: Facet = {
	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		return await prompt(useDefaults, options, [
			{
				default: 'category.sample',
				message: 'Under which category should your widget be listed?',
				name: 'category',
				type: 'input',
			},
		]);
	},

	async render(options: Options): Promise<void> {
		print(info`Generating porlet...`);

		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		print(info`  Creating {styles.scss} file`);

		await renderer.render('src/css/styles.scss', options);

		print(info`  Setting porlet headers`);

		const pkgJsonFile = ensureOutputFile(options, 'package.json');

		/* eslint-disable-next-line @liferay/no-dynamic-require, @typescript-eslint/no-var-requires */
		const pkgJson = require(pkgJsonFile.asNative);
		const portletDisplayName = toHumanReadable(pkgJson['name']);
		const portletName = getPortletName(pkgJson['name']);

		await transformJsonFile(
			pkgJsonFile,
			pkgJsonFile,
			addPortletProperties({
				'com.liferay.portlet.display-category': options.category as string,
				'com.liferay.portlet.header-portlet-css': '/css/styles.css',
				'com.liferay.portlet.instanceable': true,
				'javax.portlet.name': portletName,
				'javax.portlet.security-role-ref': 'power-user,user',
			})
		);

		if (options.addLocalizationSupport) {
			const languageFile = ensureOutputFile(
				options,
				'features/localization/Language.properties'
			);

			print(info`  Set portlet resource bundle`);

			await transformJsonFile(
				pkgJsonFile,
				pkgJsonFile,
				addPortletProperties({
					'javax.portlet.resource-bundle': 'content.Language',
				})
			);

			print(info`  Add portlet display name for English language`);

			await transformTextFile(
				languageFile,
				languageFile,
				appendLines(
					`javax.portlet.title.${portletName}=${portletDisplayName}`
				)
			);
		}
		else {
			print(info`  Set portlet display name`);

			await transformJsonFile(
				pkgJsonFile,
				pkgJsonFile,
				addPortletProperties({
					'javax.portlet.display-name': portletDisplayName,
				})
			);
		}
	},
};

export default facet;
