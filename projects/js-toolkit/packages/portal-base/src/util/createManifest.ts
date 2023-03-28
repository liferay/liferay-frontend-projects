/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	CustomElementBuildOptions,
	Project,
	RemoteAppManifestJson,
} from '@liferay/js-toolkit-core';

import abort from '../util/abort';
import findScssFiles from './findScssFiles';

/**
 * @deprecated
 * This function was used to create a remote app manifest.json file that could
 * be used to deploy the client extension but since an equivalent OSGi file
 * exists now, it is not used any more.
 *
 * It should be removed in the future.
 */
export default function createManifest(
	project: Project
): RemoteAppManifestJson {
	const options = project.build.options as CustomElementBuildOptions;
	const {htmlElementName, portletCategoryName} = options;

	if (!htmlElementName) {
		abort(
			`
Custom element name is not configured and cannot be inferred from the source code.

Please configure it using {build.options.htmlElementName} in the {liferay.json} file.`
		);
	}

	const manifest: RemoteAppManifestJson = {
		cssURLs: findScssFiles(project).map((file) =>
			project.assetsDir
				.relative(file)
				.toDotRelative()
				.asPosix.replace(/\.scss$/i, '.css')
		),
		htmlElementName,
		portletCategoryName,
		type: 'customElement',
		urls: [
			project.srcDir.relative(project.mainModuleFile).toDotRelative()
				.asPosix,
		],
		useESM: true,
	};

	return manifest;
}
