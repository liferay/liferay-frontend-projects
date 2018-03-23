import babelPluginNameAmdModules from 'babel-plugin-name-amd-modules';
import babelPluginNamespaceAmdDefine from 'babel-plugin-namespace-amd-define';
import babelPluginNamespaceModules from 'babel-plugin-namespace-modules';
import babelPluginNormalizeRequires from 'babel-plugin-normalize-requires';

/**
 * @return {Object} a Babel configuration object
 */
export default function() {
	return {
		plugins: [
			babelPluginNormalizeRequires,
			babelPluginNameAmdModules,
			babelPluginNamespaceModules,
			babelPluginNamespaceAmdDefine,
		],
	};
}
