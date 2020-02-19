/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import webpack from 'webpack';

import {buildWebpackDir} from '../../dirs';
import * as log from '../../log';

export default function writeResults(stats: webpack.Stats) {
	const {compilation} = stats;

	writeAssets(compilation.assets);
}

function writeAssets(assets: object): void {
	Object.entries(assets).forEach(([fileName, source]) => {
		const filePath = buildWebpackDir.join(fileName).asNative;

		fs.writeFileSync(filePath, source.source());

		log.debug(`Emitted file ${filePath}`);
	});
}
