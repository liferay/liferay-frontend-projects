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
import fs from 'fs';

import getPortletName from '../util/getPortletName';
import prompt from '../util/prompt';

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
		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		await renderer.render('src/css/styles.scss', options);

		// Add portlet properties

		const pkgJsonFile = options.outputPath.join('package.json');

		/* eslint-disable-next-line @liferay/no-dynamic-require, @typescript-eslint/no-var-requires */
		const pkgJson = require(pkgJsonFile.asNative);
		const portletDisplayName = pkgJson['name'];
		const portletName = getPortletName(portletDisplayName);

		print(info`Generating porlet...`);
		print(info`  Setting porlet name: {${portletDisplayName}}`);
		print(info`  Setting portlet category: {${options.category}}`);

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

		// Add portlet display name

		const languageFile: FilePath = options.outputPath.join(
			'features/localization/Language.properties'
		);

		if (fs.existsSync(languageFile.asNative)) {
			await transformJsonFile(
				pkgJsonFile,
				pkgJsonFile,
				addPortletProperties({
					'javax.portlet.resource-bundle': 'content.Language',
				})
			);

			await transformTextFile(
				languageFile,
				languageFile,
				appendLines(
					`javax.portlet.title.${portletName}=${portletDisplayName}`
				)
			);
		}
		else {
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
