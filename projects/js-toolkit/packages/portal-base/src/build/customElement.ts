/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable @liferay/no-dynamic-require */

import {Project, format} from '@liferay/js-toolkit-core';
import fs from 'fs';

import abort from '../util/abort';
import findFiles from '../util/findFiles';
import getWebpackConfiguration from '../util/getWebpackConfiguration';
import runWebpack from '../util/runWebpack';

const {info, print} = format;

export default async function customElement(project: Project): Promise<void> {
	fs.mkdirSync(project.build.dir.asNative, {recursive: true});

	checkConfiguration(project);

	copyAssets(project);

	const configuration = getWebpackConfiguration(project);

	await runWebpack(project, configuration);
}

function checkConfiguration(project: Project): void {
	if (project.pkgJson.type === 'module') {
		abort(
			'Custom element projects cannot be of {type module} (see {package.json})'
		);
	}
}

function copyAssets(project: Project): void {
	const assetFiles = findFiles(
		project.assetsDir,
		(dirent) => !dirent.name.toLowerCase().endsWith('.scss')
	);

	if (!assetFiles.length) {
		return;
	}

	print(info`Copying {${assetFiles.length}} assets...`);

	assetFiles.forEach((assetFile) => {
		const outputFile = project.build.dir.join(
			project.assetsDir.relative(assetFile)
		);

		fs.mkdirSync(outputFile.dirname().asNative, {recursive: true});

		fs.writeFileSync(
			outputFile.asNative,
			fs.readFileSync(assetFile.asNative)
		);
	});
}
