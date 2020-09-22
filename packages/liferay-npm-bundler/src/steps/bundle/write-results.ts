/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import webpack from 'webpack';

import {bundlerWebpackDir} from '../../globals';
import * as log from '../../util/log';

export default function writeResults(stats: webpack.Stats): void {
	const {compilation} = stats;

	writeAssets(compilation.assets);
}

function writeAssets(assets: object): void {
	Object.entries(assets).forEach(([fileName, source]) => {
		const filePath = bundlerWebpackDir.join(fileName).asNative;

		fs.writeFileSync(filePath, source.source());

		log.debug(`Emitted file ${filePath}`);
	});
}
