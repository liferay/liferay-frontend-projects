import babelPluginTransformEs2015ModulesAmd from 'babel-plugin-transform-es2015-modules-amd';
import babelPluginNameAmdModules from 'babel-plugin-name-amd-modules';
import babelPluginNamespaceAmdDefine from 'babel-plugin-namespace-amd-define';

/**
 * @return {Object} a Babel configuration object
 */
export default function() {
	return {
		plugins: [
			babelPluginTransformEs2015ModulesAmd,
			babelPluginNameAmdModules,
			babelPluginNamespaceAmdDefine,
		],
	};
}
