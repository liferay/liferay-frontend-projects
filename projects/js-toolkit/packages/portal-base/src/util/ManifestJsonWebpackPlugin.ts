/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project} from '@liferay/js-toolkit-core';
import webpack from 'webpack';

import createManifest from './createManifest';

export default class ManifestJsonWebpackPlugin {
	static PLUGIN_NAME = 'ManifestJsonWebpackPlugin';

	constructor(project: Project) {
		this._project = project;
	}

	apply(compiler: webpack.Compiler): void {
		compiler.hooks.thisCompilation.tap(
			ManifestJsonWebpackPlugin.PLUGIN_NAME,
			(compilation: webpack.Compilation) => {
				compilation.emitAsset(
					'manifest.json',
					new webpack.sources.RawSource(
						JSON.stringify(
							createManifest(this._project),
							null,
							'\t'
						),
						false
					)
				);
			}
		);
	}

	private _project: Project;
}
