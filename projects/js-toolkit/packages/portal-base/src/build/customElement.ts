/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable @liferay/no-dynamic-require */

import {
	ClientExtensionConfigJson,
	FilePath,
	Project,
	format,
} from '@liferay/js-toolkit-core';
import fs from 'fs';
import globby from 'globby';
import JSZip from 'jszip';
import path from 'path';

import abort from '../util/abort';
import createManifest from '../util/createManifest';
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

	await makeZip(project);
}

/**
 * Add several files to a ZIP folder.
 * @param srcDirPath source folder
 * @param srcGlobs array of globs describing files to include (in globby, i.e.
 *			POSIX, format)
 * @param destFolder the destination folder in the ZIP file
 */
function addFiles(
	srcDirPath: string,
	srcGlobs: string[],
	destFolder: JSZip
): void {
	const filePaths = globby
		.sync(srcGlobs, {
			cwd: srcDirPath,
			expandDirectories: false,
		})
		.map((posixPath) => new FilePath(posixPath, {posix: true}))
		.map((file) => file.asNative);

	filePaths.forEach((filePath) => {
		const parts = filePath.split(path.sep);
		const dirs = parts.slice(0, parts.length - 1);
		const name = parts[parts.length - 1];

		const folder = dirs.reduce(
			(folder, dir) => folder.folder(dir),
			destFolder
		);

		folder.file(name, fs.readFileSync(path.join(srcDirPath, filePath)));
	});
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

async function makeZip(project: Project): Promise<void> {
	const manifest = createManifest(project);

	const configurationPid =
		'com.liferay.client.extension.type.configuration.CETConfiguration~' +
		project.pkgJson.name;

	const clientExtensionConfigJson: ClientExtensionConfigJson = {
		[configurationPid]: {
			baseURL: `\${portalURL}/o/${project.pkgJson.name}`,
			description: project.pkgJson.description || '',
			name: project.pkgJson.name,
			sourceCodeURL: '',
			type: 'customElement',
			typeSettings: [
				`cssURLs=${manifest.cssURLs.join('\n')}`,
				`htmlElementName=${manifest.htmlElementName}`,
				'instanceable=true',
				`portletCategoryName=${manifest.portletCategoryName}`,
				`urls=${manifest.urls.join('\n')}`,
				`useESM=${manifest.useESM}`,
			],
		},
	};

	const zip = new JSZip();

	zip.file(
		`${project.pkgJson.name}.client-extension-config.json`,
		JSON.stringify(clientExtensionConfigJson, null, '\t')
	);

	addFiles(
		project.build.dir.asNative,
		['**/*', '!manifest.json'],
		zip.folder('static')
	);

	const buffer = await zip.generateAsync({
		compression: 'DEFLATE',
		compressionOptions: {
			level: 6,
		},
		type: 'nodebuffer',
	});

	fs.mkdirSync(project.dist.dir.asNative, {recursive: true});

	fs.writeFileSync(project.dist.file.asNative, buffer);
}
