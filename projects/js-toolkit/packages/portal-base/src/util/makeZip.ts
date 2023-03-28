/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	ClientExtensionConfigJson,
	ClientExtensionConfigJsonType,
	FilePath,
	Project,
} from '@liferay/js-toolkit-core';
import fs from 'fs';
import globby from 'globby';
import JSZip from 'jszip';
import path from 'path';

export interface TypeSettings {
	[key: string]: boolean | number | string | string[];
}

export default async function makeZip(
	project: Project,
	type: ClientExtensionConfigJsonType,
	typeSettings: TypeSettings
): Promise<void> {
	const configurationPid =
		'com.liferay.client.extension.type.configuration.CETConfiguration~' +
		project.pkgJson.name;

	const typeSettingsArray = Object.entries(typeSettings).reduce(
		(array, [key, value]) => {
			if (Array.isArray(value)) {
				value = value.join('\n');
			}

			array.push(`${key}=${value}`);

			return array;
		},
		[]
	);

	const clientExtensionConfigJson: ClientExtensionConfigJson = {
		[configurationPid]: {
			baseURL: `\${portalURL}/o/${project.pkgJson.name}`,
			description: project.pkgJson.description || '',
			name: project.pkgJson.name,
			sourceCodeURL: '',
			type,
			typeSettings: typeSettingsArray,
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
