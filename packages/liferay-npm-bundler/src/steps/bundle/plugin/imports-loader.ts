/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {parse} from 'acorn';
import {generate} from 'escodegen';
import {traverse} from 'estraverse';
import ESTree from 'estree';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import {addNamespace} from 'liferay-npm-build-tools-common/lib/namespace';
import project, {Project} from 'liferay-npm-build-tools-common/lib/project';

import report from '../../../report';
import ReportLogger from '../../../report/logger';

export default function(content: string): string {
	const log = report.getWebpackLogger(
		'imports-loader',
		getPrjRelPath(this.request)
	);

	// Early fail for performance: look for require/import
	if (content.indexOf('require') === -1 && content.indexOf('import') === -1) {
		log.debug(`File does not contain 'require' or 'import' statements`);

		return content;
	}

	// Early fail for performance: look for imported modules as strings
	let importsFound = false;

	for (const pkgName of Object.keys(project.imports)) {
		if (content.indexOf(pkgName) != -1) {
			importsFound = true;

			break;
		}
	}

	if (!importsFound) {
		log.debug(`File does not contain any 'imports' module`);

		return content;
	}

	// Parse source code to transform imports
	const parser = new Parser(project);

	const ast = parser.transform(content, log);

	if (!parser.modified) {
		log.debug(`File does not require any 'imports' module`);

		return content;
	}

	log.info(`File contained 'imports' which were diverted to runtime loader`);

	return generate(ast, {});
}

class Parser {
	constructor(project: Project) {
		this._project = project;
	}

	get modified(): boolean {
		return this._modified;
	}

	transform(source: string, log: ReportLogger): ESTree.Node {
		const ast = parse(source, {
			allowAwaitOutsideFunction: true,
			allowHashBang: true,
			allowImportExportEverywhere: true,
			allowReserved: true,
			allowReturnOutsideFunction: true,
			ecmaVersion: 10,
			locations: true,
			sourceType: 'module',
		});

		this._log = log;
		this._modified = false;

		traverse(ast as ESTree.Node, {
			enter: (node: ESTree.Node, parentNode: ESTree.Node) =>
				this._enter(node, parentNode),
		});

		return ast as ESTree.Node;
	}

	_enter(node: ESTree.Node, parentNode: ESTree.Node): void {
		let modified = false;

		switch (node.type) {
			case 'CallExpression':
				modified = this._enterCallExpression(node);
				break;

			case 'ImportDeclaration':
				modified = this._enterImportDeclaration(node, parentNode);
				break;

			default:
				break;
		}

		this._modified = this._modified || modified;
	}

	private _enterCallExpression(node: ESTree.CallExpression): boolean {
		const {_log: log} = this;
		const {callee} = node;

		if (callee.type !== 'Identifier' || callee.name !== 'require') {
			return false;
		}

		const {arguments: params} = node;

		if (params.length != 1) {
			return false;
		}

		if (params[0].type !== 'Literal') {
			return false;
		}

		const {value: moduleName} = params[0];

		if (typeof moduleName !== 'string') {
			return;
		}

		const {imports} = this._project;

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

	private _enterImportDeclaration(
		node: ESTree.ImportDeclaration,
		parentNode: ESTree.Node
	): boolean {
		const {imports} = this._project;
		const moduleName = node.source.value as string;
		const config = imports[moduleName];

		if (!config) {
			return false;
		}

		const namespacedModuleName = addNamespace(moduleName, {
			name: config.provider,
		});

		const {_log: log} = this;

		log.debug(
			`Import '${moduleName}' diverted to '${namespacedModuleName}'`
		);

		const lines = node.specifiers.map(specifier => {
			switch (specifier.type) {
				case 'ImportSpecifier':
					return `var ${specifier.local.name} = __REQUIRE__('${namespacedModuleName}')['${specifier.imported.name}'];`;

				case 'ImportDefaultSpecifier':
					// TODO: decide if new need interop here
					return `var ${specifier.local.name} = __REQUIRE__('${namespacedModuleName}');`;

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

		const ast = (parse(lines.join('\n')) as unknown) as ESTree.Program;

		parentNode.body = [
			...ast.body,
			...parentNode.body.filter(child => child !== node),
		];

		return true;
	}

	private _log: ReportLogger;
	private _modified = false;
	private readonly _project: Project;
}

function getPrjRelPath(request: string): string {
	const absFilePath = request.split('!')[1];

	return project.dir.relative(new FilePath(absFilePath)).asNative;
}
