/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import template from 'babel-template';
import fs from 'fs';
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
					const {opts, file} = state;
					let {dependencies} = state;
					const {log} = babelIpc.get(state, () => ({
						log: new PluginLogger(),
					}));

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

					let defineNode = buildDefine({
						SOURCE: body,
						DEPS: buildDeps(),
					});

					defineNode = applyUserDefinedTemplateIfPresent(
						file.opts.filenameRelative,
						defineNode,
						log
					);

					if (!Array.isArray(defineNode)) {
						defineNode = [defineNode];
					}

					node.body = defineNode;

					if (dependencies.length == 0) {
						log.info(
							'wrap-modules-amd',
							'No dependencies detected'
						);
					} else {
						log.info(
							'wrap-modules-amd',
							`Detected dependencies: ${dependencies.join(', ')}`
						);
					}
				},
			},
		},
	};
}

function applyUserDefinedTemplateIfPresent(filenameRelative, defineNode, log) {
	const templateFile = `${filenameRelative}.wrap-modules-amd.template`;

	if (!fs.existsSync(templateFile)) {
		return defineNode;
	}

	log.info('wrap-modules-amd', 'Applied user template to wrap file');

	const buildUserTemplate = template(
		fs.readFileSync(templateFile).toString()
	);

	fs.unlinkSync(templateFile);

	return buildUserTemplate({
		__WRAPPED_MODULE__: defineNode,
	});
}
