import babelPluginNormalizeRequires from 'babel-plugin-normalize-requires';
import babelPluginNameAmdModules from 'babel-plugin-name-amd-modules';
import babelPluginNamespaceAmdDefine from 'babel-plugin-namespace-amd-define';

/**
 * @return {Object} a Babel configuration object
 */
export default function() {
	return {
		plugins: [
			babelPluginNormalizeRequires,
			babelPluginNameAmdModules,
			babelPluginNamespaceAmdDefine,
		],
	};
}
