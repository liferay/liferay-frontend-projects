/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import babelPluginAddModuleMetadata from 'babel-plugin-add-module-metadata';
import babelPluginAliasModules from 'babel-plugin-alias-modules';
import babelPluginMinifyDeadCodeElimination from 'babel-plugin-minify-dead-code-elimination';
import babelPluginNameAmdModules from 'babel-plugin-name-amd-modules';
import babelPluginNamespaceAmdDefine from 'babel-plugin-namespace-amd-define';
import babelPluginNamespaceModules from 'babel-plugin-namespace-modules';
import babelPluginNormalizeRequires from 'babel-plugin-normalize-requires';
import babelPluginTransformNodeEnvInline from 'babel-plugin-transform-node-env-inline';
import babelPluginWrapModulesAmd from 'babel-plugin-wrap-modules-amd';

/**
 * @return {Object} a Babel configuration object
 */
export default function() {
	return {
		plugins: [
			babelPluginAliasModules,
			babelPluginAddModuleMetadata,
			babelPluginNormalizeRequires,
			babelPluginTransformNodeEnvInline,
			[
				babelPluginMinifyDeadCodeElimination,
				{
					keepClassName: true,
					keepFnArgs: true,
					keepFnName: true,
				},
			],
			babelPluginWrapModulesAmd,
			babelPluginNameAmdModules,
			babelPluginNamespaceModules,
			babelPluginNamespaceAmdDefine,
		],
	};
}
