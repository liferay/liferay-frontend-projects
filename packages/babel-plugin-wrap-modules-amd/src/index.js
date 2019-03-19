/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import template from 'babel-template';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

const buildDefine = template(`
     define(DEPS, function(module, exports, require) {
        // Make module believe it is running under Node.js
        var define = undefined;
 	    SOURCE
     })
 `);

/**
 * @return {object} a babel visitor
 */
export default function({types: t}) {
	const wrapVisitor = {
		Identifier(path, {dependencies}) {
			const node = path.node;

			if (node.name === 'require') {
				const parent = path.parent;

				if (
					t.isCallExpression(parent) &&
					parent.callee === node &&
					parent.arguments.length == 1
				) {
					const argument0 = parent.arguments[0];

					if (t.isLiteral(argument0)) {
						const moduleName = argument0.value;

						dependencies[moduleName] = moduleName;
					}
				}
			}
		},
	};

	return {
		visitor: {
			Program: {
				enter(path, state) {
					state.dependencies = {};
				},
				exit(path, state) {
					const {opts} = state;
					let {dependencies} = state;

					// We must traverse the AST again because some plugins emit
					// their require() calls after exiting Program node :-(
					path.traverse(wrapVisitor, {opts, dependencies});

					const {node} = path;
					const {body} = node;

					dependencies = Object.keys(dependencies).map(
						dep => `'${dep}'`
					);

					const buildDeps = template(`[
                         'module', 'exports', 'require' 
                         ${dependencies.length > 0 ? ',' : ''} 
                         ${dependencies.join()}
                     ]`);

					node.body = [
						buildDefine({
							SOURCE: body,
							DEPS: buildDeps(),
						}),
					];

					// Log results
					const {log} = babelIpc.get(state, () => ({
						log: new PluginLogger(),
					}));

					log.info(
						'wrap-modules-amd',
						'Detected dependencies:',
						dependencies.join(', ')
					);
				},
			},
		},
	};
}
