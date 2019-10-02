/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	BundleLoaderReturn,
	BundleLoaderContext,
} from 'liferay-npm-build-tools-common/lib/project/types.d';

export default function(context: BundleLoaderContext): BundleLoaderReturn {
	const {content, filePath, extraArtifacts, log} = context;

	const filePathParts = filePath.split('.');

	if (Number.isNaN(parseInt(filePathParts[filePathParts.length - 2], 16))) {
		log.info(
			'remove-webpack-hash',
			`No webpack hash in filename; nothing to be done`
		);

		return;
	}

	const newFilePath =
		filePathParts.slice(0, filePathParts.length - 2).join('.') +
		'.' +
		filePathParts[filePathParts.length - 1];

	extraArtifacts[newFilePath] = content;
	context.content = undefined;

	log.info('remove-webpack-hash', `Diverting file output to ${newFilePath}`);

	return undefined;
}
