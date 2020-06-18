/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
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
		var global = window;
		{
		  SOURCE
		}
     })
 `);

/**
 * @return {object} a babel visitor
 */
export default function({types: t}) {
	const wrapVisitor = {
		Identifier(path, state) {
			const {node} = path;
			const {dependencies} = state;
			const {log} = babelIpc.get(state, () => ({
				log: new PluginLogger(),
			}));

			if (node.name === 'require') {
				const parent = path.parent;

				if (
					path.scope.hasBinding('require') &&
					!state['webpackWarnIssued']
				) {
					state['webpackWarnIssued'] = true;

					log.warn(
						'wrap-modules-amd',
						`Module looks like a webpack bundle, local require() ` +
							`calls will be ignored`
					).linkToIssue(389);

					return;
				}

				if (
					!t.isCallExpression(parent) ||
					parent.callee !== node ||
					parent.arguments.length != 1
				) {
					return;
				}

				const argument0 = parent.arguments[0];

				if (argument0.type === 'StringLiteral') {
					const moduleName = argument0.value;

					dependencies[moduleName] = moduleName;

					return;
				}

				if (
					argument0.type === 'TemplateLiteral' &&
					argument0.quasis.length === 1
				) {
					const moduleName = argument0.quasis[0].value.raw;

					dependencies[moduleName] = moduleName;

					return;
				}

				log.error(
					'wrap-modules-amd',
					'Module has a non static require, which is not ' +
						'supported: module may fail when executed'
				).linkToIssue(588);
			}
		},
	};

	return {
		visitor: {
			Program: {
				exit(path, state) {
					const {filename} = state.file.opts;
					const {log} = babelIpc.get(state, () => ({
						log: new PluginLogger(),
					}));

					let dependencies = {};

					// We must traverse the AST again because some plugins emit
					// their require() calls after exiting Program node :-(
					state.dependencies = dependencies;
					path.traverse(wrapVisitor, state);

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
						filename,
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

function applyUserDefinedTemplateIfPresent(filename, defineNode, log) {
	const templateFile = `${filename}.wrap-modules-amd.template`;

	if (!fs.existsSync(templateFile)) {
		return defineNode;
	}

	log.info('wrap-modules-amd', 'Applied user template to wrap file');

	const buildUserTemplate = template(`
		(function() {
			${fs.readFileSync(templateFile).toString()}
		})();
	`);

	fs.unlinkSync(templateFile);

	return buildUserTemplate({
		__WRAPPED_MODULE__: defineNode,
	});
}
