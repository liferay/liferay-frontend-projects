import babelPluginNormalizeRequires from 'babel-plugin-normalize-requires';
import babelPluginShimNodejs from 'babel-plugin-shim-nodejs';
import babelPluginWrapModulesAmd from 'babel-plugin-wrap-modules-amd';
import babelPluginNameAmdModules from 'babel-plugin-name-amd-modules';
import babelPluginNamespaceAmdDefine from 'babel-plugin-namespace-amd-define';

/**
 * @param {Object} context
 * @param {Object} opts
 * @return {Object} a Babel configuration object
 */
export default function(context, opts = {}) {
  return {
    plugins: [
      babelPluginNormalizeRequires,
      babelPluginShimNodejs,
      babelPluginWrapModulesAmd,
      babelPluginNameAmdModules,
      babelPluginNamespaceAmdDefine,
    ],
  };
}
