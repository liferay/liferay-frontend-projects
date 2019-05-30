/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

/**
 * Valid babel plugin options are:
 *     namespace: 'Liferay.Loader'
 * @return {object} a babel visitor
 */
export default function() {
	let extraNamespaceCount;
	let firstDefineNamespaced;

	const namespaceVisitor = {
		Identifier(path) {
			if (path.node.name === 'define') {
				if (
					path.parent.type === 'MemberExpression' &&
					path.parent.property === path.node
				) {
					return;
				}

				if (
					path.parent.type === 'ObjectProperty' &&
					path.parent.key === path.node
				) {
					return;
				}

				let scope;

				// Find if 'define' is defined in any scope
				for (scope = path.scope; scope != null; scope = scope.parent) {
					if (scope.bindings.define || scope.globals.define) {
						break;
					}
				}

				if (
					scope == null ||
					(scope.parent == null && !scope.bindings.define)
				) {
					// If 'define' is not defined in any scope namespace or
					// defined in the root scope as global...
					if (!firstDefineNamespaced) {
						// ...and it's its first appearance, namespace it
						const namespace =
							this.opts.namespace || 'Liferay.Loader';

						path.node.name = `${namespace}.define`;

						firstDefineNamespaced = true;
					} else {
						// ...and appeared before, record a new extra appearance
						extraNamespaceCount++;
					}
				}
			}
		},
	};

	return {
		visitor: {
			Program: {
				exit(path, state) {
					// We must traverse the AST again because the third party
					// transform-es2015-modules-amd emits its define() call after
					// Program exit :-(
					firstDefineNamespaced = false;
					extraNamespaceCount = 0;

					path.traverse(namespaceVisitor, {opts: state.opts});

					if (extraNamespaceCount > 0) {
						const {log} = babelIpc.get(state, () => ({
							log: new PluginLogger(),
						}));

						if (firstDefineNamespaced) {
							log.info(
								'namespace-amd-define',
								'Namespaced first AMD define in file'
							);
						}

						if (extraNamespaceCount) {
							log.warn(
								'namespace-amd-define',
								'Found',
								extraNamespaceCount,
								'define() calls inside the module definition',
								'which have been ignored as they should never',
								'be executed during runtime'
							);
						}
					}
				},
			},
		},
	};
}
