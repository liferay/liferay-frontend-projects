/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	BundlerLoaderContext,
	BundlerLoaderReturn,
} from 'liferay-npm-build-tools-common/lib/api/loaders';

/**
 * This loader:
 *
 *   1. Discards any webpack artifact not containing ES5 code
 *   2. Removes `-es5` from file and module names when present
 *
 * This way, the bundler can treat any known Angular version the same, no matter
 * how webpack produced its output.
 *
 * This is because Angular version <=10 produce artifacts for ES5 and ES2015
 * targets, while Angular versions >=10 only produce one type of artifact, not
 * differentiated by file name.
 *
 * @deprecated Use the loader from @liferay/portal-adapt-base instead
 */
export default function (context: BundlerLoaderContext): BundlerLoaderReturn {
	const {filePath, log} = context;

	if (filePath.includes('-es') && !filePath.includes('-es5.')) {
		context.content = undefined;
		context.extraArtifacts = {};

		log.info(
			'normalize-angular-output',
			`Discarding output because source is not ES5 code`
		);

		return undefined;
	}

	if (filePath.includes('-es5.') && context.content) {
		const newFilePath = filePath.replace('-es5.', '.');

		context.extraArtifacts[newFilePath] = context.content.replace(
			'-es5',
			''
		);
		context.content = undefined;

		log.info(
			'normalize-angular-output',
			`Diverted main output to ${newFilePath}`
		);
	}

	Object.keys(context.extraArtifacts).forEach((filePath) => {
		if (filePath.includes('-es5.') && context.extraArtifacts[filePath]) {
			const newFilePath = filePath.replace('-es5.', '.');

			context.extraArtifacts[newFilePath] = context.extraArtifacts[
				filePath
			].replace('-es5', '');
			delete context.extraArtifacts[filePath];

			log.info(
				'normalize-angular-output',
				`Diverted extra artifact ${filePath} to ${newFilePath}`
			);
		}
	});

	return undefined;
}
