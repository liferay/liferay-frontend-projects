/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {print, debug} from 'liferay-npm-build-tools-common/lib/format';
import webpack from 'webpack';

import {buildWebpackDir} from './dirs';

export default function writeResults(stats: webpack.Stats) {
	fs.ensureDirSync(buildWebpackDir.asNative);

	const {compilation} = stats;

	writeAssets(compilation.assets);
}

function writeAssets(assets: object): void {
	Object.entries(assets).forEach(([fileName, source]) => {
		const filePath = buildWebpackDir.join(fileName).asNative;

		fs.writeFileSync(filePath, source.source());

		print(debug`Emitted file ${filePath}`);
	});
}
