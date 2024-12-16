/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	B3Imports as Imports,
	JsSourceTransform,
	addNamespace,
	replaceJsSource,
} from '@liferay/js-toolkit-core';
import {parse} from 'acorn';
import estree from 'estree';

import {project} from '../../../globals';
import ReportLogger from '../../../report/logger';

export default function transformImports(
	log: ReportLogger,
	imports: Imports
): JsSourceTransform {
	let transformed = false;

	return ((source) =>
		replaceJsSource(source, {
			enter(node, parentNode) {
				let modified = false;

				if (node.type === 'CallExpression') {
					modified = transformCallExpression(log, node, imports);
				}
				else if (node.type === 'ImportDeclaration') {
					modified = transformImportDeclaration(
						log,
						node,
						parentNode
					);
				}

				transformed = transformed || modified;
			},

			leave(node) {
				if (node.type !== 'Program') {
					return;
				}

				if (transformed) {
					log.info(
						`File contained 'imports' which were diverted to runtime loader`
					);
				}
				else {
					log.debug(`File does not require any 'imports' module`);
				}
			},
		})) as JsSourceTransform;
}

function transformCallExpression(
	log: ReportLogger,
	node: estree.CallExpression,
	imports: Imports
): boolean {
	const {callee} = node;

	if (callee.type !== 'Identifier' || callee.name !== 'require') {
		return false;
	}

	const {arguments: params} = node;

	if (params.length !== 1) {
		return false;
	}

	if (params[0].type !== 'Literal') {
		return false;
	}

	const {value: moduleName} = params[0];

	if (typeof moduleName !== 'string') {
		return;
	}

	const config = imports[moduleName];

	if (!config) {
		return false;
	}

	callee.name = '__REQUIRE__';
	params[0]['value'] = addNamespace(moduleName, {
		name: config.provider,
	});

	log.debug(`Import '${moduleName}' diverted to '${params[0]['value']}'`);

	return true;
}

function transformImportDeclaration(
	log: ReportLogger,
	node: estree.ImportDeclaration,
	parentNode: estree.Node
): boolean {
	const {imports} = project;
	const moduleName = node.source.value as string;
	const config = imports[moduleName];

	if (!config) {
		return false;
	}

	const namespacedModuleName = addNamespace(moduleName, {
		name: config.provider,
	});

	log.debug(`Import '${moduleName}' diverted to '${namespacedModuleName}'`);

	const lines = node.specifiers.map((specifier) => {
		switch (specifier.type) {
			case 'ImportSpecifier':
				return `var ${specifier.local.name} = __REQUIRE__('${namespacedModuleName}')['${specifier.imported.name}'];`;

			case 'ImportDefaultSpecifier':
				return `
					var ${specifier.local.name}_raw = __REQUIRE__('${namespacedModuleName}');
					var ${specifier.local.name} = 
						${specifier.local.name}_raw && ${specifier.local.name}_raw.__esModule 
							? ${specifier.local.name}_raw['default'] 
							: ${specifier.local.name}_raw;
				`;

			case 'ImportNamespaceSpecifier':
				return `var ${specifier.local.name} = __REQUIRE__('${namespacedModuleName}');`;

			// no default

		}
	});

	if (parentNode.type !== 'Program') {
		log.error(
			`Found 'import' statements not at the top of the file: they will be ignored`
		);

		return false;
	}

	const program = parse(lines.join('\n')) as estree.Node;

	if (program.type !== 'Program') {
		throw new Error('Code cannot be parsed as an AST Program node');
	}

	parentNode.body = [
		...program.body,
		...parentNode.body.filter((child) => child !== node),
	];

	return true;
}
