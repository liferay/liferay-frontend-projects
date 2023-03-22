/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import {Project, format} from '@liferay/js-toolkit-core';
import findFiles from '../util/findFiles';

const {info, print} = format;

export default function copyAssets(project: Project): void {
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
