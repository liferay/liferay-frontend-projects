/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable @liferay/no-dynamic-require */

import {
	CustomElementBuildOptions,
	Project,
	format,
} from '@liferay/js-toolkit-core';
import fs from 'fs';
import path from 'path';

import abort from '../util/abort';
import copyAssets from '../util/copyAssets';
import findScssFiles from '../util/findScssFiles';
import getWebpackConfiguration from '../util/getWebpackConfiguration';
import makeZip from '../util/makeZip';
import runWebpack from '../util/runWebpack';

const {print, warn} = format;

export default async function customElement(project: Project): Promise<void> {
	const options = project.build.options as CustomElementBuildOptions;

	if (
		project.isWorkspace &&
		!fs.existsSync(
			path.join(project.build.dir.asNative, 'client-extension.yaml')
		)
	) {
		print(
			warn`
Your project does not have a 'client-extension.yaml', which is required when using within a Liferay workspace.
`
		);
	}

	checkConfiguration(project);

	copyAssets(project);

	await buildProject(project);

	if (!project.isWorkspace) {
		const typeSettings = {
			cssURLs: findScssFiles(project).map((file) =>
				project.assetsDir
					.relative(file)
					.toDotRelative()
					.asPosix.replace(/\.scss$/i, '.css')
			),
			htmlElementName: options.htmlElementName,
			instanceable: true,
			portletCategoryName: options.portletCategoryName,
			urls: [
				project.srcDir.relative(project.mainModuleFile).toDotRelative()
					.asPosix,
			],
			useESM: true,
		};

		await makeZip(project, 'customElement', typeSettings);
	}
}

function checkConfiguration(project: Project): void {
	const options = project.build.options as CustomElementBuildOptions;

	if (project.pkgJson.type === 'module') {
		abort(
			'Custom element projects cannot be of {type module} (see {package.json}).'
		);
	}

	if (!options.htmlElementName) {
		abort(
			`
Custom element name is not configured and cannot be inferred from the source code.

Please configure it using {build.options.htmlElementName} in the {liferay.json} file.`
		);
	}
}

async function buildProject(project: Project): Promise<void> {
	await runWebpack(project, getWebpackConfiguration(project));
}
