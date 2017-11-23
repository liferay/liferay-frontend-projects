import babelPluginNormalizeRequires from 'babel-plugin-normalize-requires';
import babelPluginTransformNodeEnvInline from 'babel-plugin-transform-node-env-inline';
import babelPluginWrapModulesAmd from 'babel-plugin-wrap-modules-amd';
import babelPluginNameAmdModules from 'babel-plugin-name-amd-modules';
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
			babelPluginNamespaceAmdDefine,
		],
	};
}
