import babelPluginNormalizeRequires from 'babel-plugin-normalize-requires';
import babelPluginTransformNodeEnvInline from 'babel-plugin-transform-node-env-inline';
import babelPluginWrapModulesAmd from 'babel-plugin-wrap-modules-amd';
import babelPluginNameAmdModules from 'babel-plugin-name-amd-modules';
import babelPluginNamespaceModules from 'babel-plugin-namespace-modules';
import babelPluginNamespaceAmdDefine from 'babel-plugin-namespace-amd-define';

/**
 * @return {Object} a Babel configuration object
 */
export default function() {
	return {
		plugins: [
			babelPluginNormalizeRequires,
			babelPluginTransformNodeEnvInline,
			babelPluginWrapModulesAmd,
			babelPluginNameAmdModules,
			babelPluginNamespaceModules,
			babelPluginNamespaceAmdDefine,
		],
	};
}
