/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	TemplateRenderer,
	addPortletProperties,
	appendLines,
	transformJsonFile,
	transformTextFile,
} from '@liferay/js-toolkit-core';
import fs from 'fs';

import getPortletName from '../util/getPortletName';
import prompt from '../util/prompt';

import type {Options} from '../index';

export async function processOptions(options: Options): Promise<Options> {
	return await prompt(options, [
		{
			default: 'category.sample',
			message: 'Under which category should your widget be listed?',
			name: 'category',
			type: 'input',
		},
	]);
}

export async function render(options: Options): Promise<void> {
	const renderer = new TemplateRenderer(
		new FilePath(__dirname).join('templates'),
		options.outputPath
	);

	await renderer.render('assets/css/styles.css', options);

	// Add portlet properties

	const pkgJsonFile = options.outputPath.join('package.json');

	/* eslint-disable-next-line @liferay/liferay/no-dynamic-require, @typescript-eslint/no-var-requires */
	const pkgJson = require(pkgJsonFile.asNative);
	const portletName = getPortletName(pkgJson['name']);

	await transformJsonFile(
		pkgJsonFile,
		pkgJsonFile,
		addPortletProperties({
			'com.liferay.portlet.display-category': options.category,
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
			appendLines(`javax.portlet.title.${portletName}=${pkgJson['name']}`)
		);
	}
	else {
		await transformJsonFile(
			pkgJsonFile,
			pkgJsonFile,
			addPortletProperties({
				'javax.portlet.display-name': pkgJson['name'],
			})
		);
	}
}
