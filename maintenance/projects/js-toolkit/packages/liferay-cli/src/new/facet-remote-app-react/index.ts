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
} from '@liferay/js-toolkit-core';

import dependencies from '../../dependencies.json';
import ensureOutputFile from '../../util/ensureOutputFile';
import prompt from '../../util/prompt';

import type {Options} from '../index';
import type {RemoteAppTargetFacet} from '../target-remote-app';

const {
	PkgJson: {addDependencies},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const FACET_ID = 'facet-remote-app-react';

const facet: RemoteAppTargetFacet = {
	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		return await prompt(useDefaults, options, [
			{
				default: getCustomElementName(options),
				message:
					"What will be the custom element's HTML tag name?\n" +
					'\n' +
					'  💡 Note that, according to the custom element specification,\n' +
					'     it must contain at least ony hyphen (-) and start with a\n' +
					'     letter.\n' +
					'\n' +
					'     There is also a list of reserved names and characters\n' +
					'     other than alphanumeric, dot, underline, or hyphen are\n' +
					'     not allowed.\n' +
					'\n' +
					'     See the specification for more details.\n' +
					'\n',
				name: 'customElementName',
				type: 'string',
			},
			{
				default: false,
				message:
					'Do you want the custom element to render using shadow DOM?\n' +
					'\n' +
					'  💡 This will sandbox the custom element markup from the one\n' +
					'     outside. It will also prevent CSS styles from outside to\n' +
					'     affect the custom element rendering.\n' +
					'\n',
				name: 'useShadowDOM',
				type: 'confirm',
			},
		]);
	},

	async render(options: Options): Promise<void> {
		print(info`Generating sample code...`);

		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		print(info`  Creating custom element`);

		await renderer.render('assets/css/styles.scss', options);
		await renderer.render('src/AppComponent.js', options);
		await renderer.render('src/index.js', options);

		if (options.platform === 'portal-agnostic') {
			print(info`  Adding React dependencies`);

			const pkgJsonFile = ensureOutputFile(options, 'package.json');

			await transformJsonFile(
				pkgJsonFile,
				pkgJsonFile,
				addDependencies(dependencies[FACET_ID]['dependencies']),
				addDependencies(
					dependencies[FACET_ID]['devDependencies'],
					'dev'
				)
			);
		}
	},
};

function getCustomElementName(options: Options): string {
	const name = options.name.toLowerCase();

	let elementName = '';
	let needsHyphen = true;

	if (!name[0].match(/[a-z]/)) {
		elementName += 'c-';
		needsHyphen = false;
	}

	for (let i = 0; i < name.length; i++) {
		if (name[i].match(/[a-z0-9\-_.]/)) {
			elementName += name[i];
		}
		else {
			elementName += '_';
		}
	}

	if (needsHyphen) {
		elementName += '-element';
	}

	return elementName;
}

export default facet;
