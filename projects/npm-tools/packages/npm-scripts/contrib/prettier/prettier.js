/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Sample script that you can drop into your path to expose the
 * "liferay-npm-scripts prettier" subcommand to VSCode
 */

const fs = require('fs');
const path = require('path');

let outputChannel;

// Keep this debug function around because debugging VSCode extensions is a
// pain.
//
// eslint-disable-next-line no-unused-vars
const debug = (line) => {
	try {
		if (!outputChannel) {
			const {window} = require('vscode');

			outputChannel = window.createOutputChannel('liferay-npm-scripts');
		}

		outputChannel.appendLine(line);
	}
	catch (_error) {

		// All hope is lost.

	}
};

// Remember last-used prettier instance so that it can be used as a fallback.

let prettier;

/**
 * Exports properties required by the prettier-vscode plugin.
 *
 * See: https://github.com/prettier/prettier-vscode/blob/cd1b3aa1f40f9fb5/src/ModuleResolver.ts#L122-L127
 */
module.exports = {
	format(source, options = {}) {
		const prettier = prepare(options.filepath);

		if (prettier) {
			return prettier.format(source, options);
		}
		else {

			// Last-resort fallback.

			return source;
		}
	},

	getFileInfo(filepath, options = {}) {
		const prettier = prepare(filepath);

		if (prettier) {
			return prettier.getFileInfo(filepath, options);
		}
		else {
			return Promise.resolve({
				ignored: false,
				inferredParser: 'babel',
			});
		}
	},

	getSupportInfo(version) {
		const prettier = prepare();

		if (prettier) {
			return prettier.getSupportInfo(version);
		}
		else {

			// Fallback snapshot from current version of Prettier (1.19.1).
			/* eslint-disable sort-keys */
			return {
				languages: [
					{
						name: 'JavaScript',
						type: 'programming',
						tmScope: 'source.js',
						aceMode: 'javascript',
						codemirrorMode: 'javascript',
						codemirrorMimeType: 'text/javascript',
						color: '#f1e05a',
						aliases: ['js', 'node'],
						extensions: [
							'.js',
							'._js',
							'.bones',
							'.es',
							'.es6',
							'.frag',
							'.gs',
							'.jake',
							'.jsb',
							'.jscad',
							'.jsfl',
							'.jsm',
							'.jss',
							'.mjs',
							'.njs',
							'.pac',
							'.sjs',
							'.ssjs',
							'.xsjs',
							'.xsjslib',
						],
						filenames: ['Jakefile'],
						interpreters: [
							'chakra',
							'd8',
							'js',
							'node',
							'rhino',
							'v8',
							'v8-shell',
							'nodejs',
						],
						linguistLanguageId: 183,
						since: '0.0.0',
						parsers: ['babel', 'flow'],
						vscodeLanguageIds: ['javascript', 'mongo'],
					},
					{
						name: 'Flow',
						type: 'programming',
						tmScope: 'source.js',
						aceMode: 'javascript',
						codemirrorMode: 'javascript',
						codemirrorMimeType: 'text/javascript',
						color: '#f1e05a',
						aliases: [],
						extensions: ['.js.flow'],
						filenames: [],
						interpreters: [
							'chakra',
							'd8',
							'js',
							'node',
							'rhino',
							'v8',
							'v8-shell',
						],
						linguistLanguageId: 183,
						since: '0.0.0',
						parsers: ['babel', 'flow'],
						vscodeLanguageIds: ['javascript'],
					},
					{
						name: 'JSX',
						type: 'programming',
						group: 'JavaScript',
						extensions: ['.jsx'],
						tmScope: 'source.js.jsx',
						aceMode: 'javascript',
						codemirrorMode: 'jsx',
						codemirrorMimeType: 'text/jsx',
						linguistLanguageId: 178,
						since: '0.0.0',
						parsers: ['babel', 'flow'],
						vscodeLanguageIds: ['javascriptreact'],
					},
					{
						name: 'TypeScript',
						type: 'programming',
						color: '#2b7489',
						aliases: ['ts'],
						interpreters: ['deno', 'ts-node'],
						extensions: ['.ts'],
						tmScope: 'source.ts',
						aceMode: 'typescript',
						codemirrorMode: 'javascript',
						codemirrorMimeType: 'application/typescript',
						linguistLanguageId: 378,
						since: '1.4.0',
						parsers: ['typescript'],
						vscodeLanguageIds: ['typescript'],
					},
					{
						name: 'TSX',
						type: 'programming',
						group: 'TypeScript',
						extensions: ['.tsx'],
						tmScope: 'source.tsx',
						aceMode: 'javascript',
						codemirrorMode: 'jsx',
						codemirrorMimeType: 'text/jsx',
						linguistLanguageId: 94901924,
						since: '1.4.0',
						parsers: ['typescript'],
						vscodeLanguageIds: ['typescriptreact'],
					},
					{
						name: 'JSON.stringify',
						type: 'data',
						tmScope: 'source.json',
						aceMode: 'json',
						codemirrorMode: 'javascript',
						codemirrorMimeType: 'application/json',
						searchable: false,
						extensions: [],
						filenames: [
							'package.json',
							'package-lock.json',
							'composer.json',
						],
						linguistLanguageId: 174,
						since: '1.13.0',
						parsers: ['json-stringify'],
						vscodeLanguageIds: ['json'],
					},
					{
						name: 'JSON',
						type: 'data',
						tmScope: 'source.json',
						aceMode: 'json',
						codemirrorMode: 'javascript',
						codemirrorMimeType: 'application/json',
						searchable: false,
						extensions: [
							'.json',
							'.avsc',
							'.geojson',
							'.gltf',
							'.har',
							'.ice',
							'.JSON-tmLanguage',
							'.jsonl',
							'.mcmeta',
							'.tfstate',
							'.tfstate.backup',
							'.topojson',
							'.webapp',
							'.webmanifest',
							'.yy',
							'.yyp',
						],
						filenames: [
							'.arcconfig',
							'.htmlhintrc',
							'.tern-config',
							'.tern-project',
							'.watchmanconfig',
							'composer.lock',
							'mcmod.info',
							'.prettierrc',
						],
						linguistLanguageId: 174,
						since: '1.5.0',
						parsers: ['json'],
						vscodeLanguageIds: ['json'],
					},
					{
						name: 'JSON with Comments',
						type: 'data',
						group: 'JSON',
						tmScope: 'source.js',
						aceMode: 'javascript',
						codemirrorMode: 'javascript',
						codemirrorMimeType: 'text/javascript',
						aliases: ['jsonc'],
						extensions: [
							'.sublime-build',
							'.sublime-commands',
							'.sublime-completions',
							'.sublime-keymap',
							'.sublime-macro',
							'.sublime-menu',
							'.sublime-mousemap',
							'.sublime-project',
							'.sublime-settings',
							'.sublime-theme',
							'.sublime-workspace',
							'.sublime_metrics',
							'.sublime_session',
						],
						filenames: [
							'.babelrc',
							'.eslintrc.json',
							'.jscsrc',
							'.jshintrc',
							'.jslintrc',
							'jsconfig.json',
							'language-configuration.json',
							'tsconfig.json',
							'.eslintrc',
						],
						linguistLanguageId: 423,
						since: '1.5.0',
						parsers: ['json'],
						vscodeLanguageIds: ['jsonc'],
					},
					{
						name: 'JSON5',
						type: 'data',
						extensions: ['.json5'],
						tmScope: 'source.js',
						aceMode: 'javascript',
						codemirrorMode: 'javascript',
						codemirrorMimeType: 'application/json',
						linguistLanguageId: 175,
						since: '1.13.0',
						parsers: ['json5'],
						vscodeLanguageIds: ['json5'],
					},
					{
						name: 'CSS',
						type: 'markup',
						tmScope: 'source.css',
						aceMode: 'css',
						codemirrorMode: 'css',
						codemirrorMimeType: 'text/css',
						color: '#563d7c',
						extensions: ['.css'],
						linguistLanguageId: 50,
						since: '1.4.0',
						parsers: ['css'],
						vscodeLanguageIds: ['css'],
					},
					{
						name: 'PostCSS',
						type: 'markup',
						tmScope: 'source.postcss',
						group: 'CSS',
						extensions: ['.pcss', '.postcss'],
						aceMode: 'text',
						linguistLanguageId: 262764437,
						since: '1.4.0',
						parsers: ['css'],
						vscodeLanguageIds: ['postcss'],
					},
					{
						name: 'Less',
						type: 'markup',
						group: 'CSS',
						extensions: ['.less'],
						tmScope: 'source.css.less',
						aceMode: 'less',
						codemirrorMode: 'css',
						codemirrorMimeType: 'text/css',
						linguistLanguageId: 198,
						since: '1.4.0',
						parsers: ['less'],
						vscodeLanguageIds: ['less'],
					},
					{
						name: 'SCSS',
						type: 'markup',
						tmScope: 'source.css.scss',
						group: 'CSS',
						aceMode: 'scss',
						codemirrorMode: 'css',
						codemirrorMimeType: 'text/x-scss',
						extensions: ['.scss'],
						linguistLanguageId: 329,
						since: '1.4.0',
						parsers: ['scss'],
						vscodeLanguageIds: ['scss'],
					},
					{
						name: 'GraphQL',
						type: 'data',
						extensions: ['.graphql', '.gql', '.graphqls'],
						tmScope: 'source.graphql',
						aceMode: 'text',
						linguistLanguageId: 139,
						since: '1.5.0',
						parsers: ['graphql'],
						vscodeLanguageIds: ['graphql'],
					},
					{
						name: 'Markdown',
						type: 'prose',
						aliases: ['pandoc'],
						aceMode: 'markdown',
						codemirrorMode: 'gfm',
						codemirrorMimeType: 'text/x-gfm',
						wrap: true,
						extensions: [
							'.md',
							'.markdown',
							'.mdown',
							'.mdwn',
							'.mkd',
							'.mkdn',
							'.mkdown',
							'.ronn',
							'.workbook',
						],
						filenames: ['contents.lr', 'README'],
						tmScope: 'source.gfm',
						linguistLanguageId: 222,
						since: '1.8.0',
						parsers: ['markdown'],
						vscodeLanguageIds: ['markdown'],
					},
					{
						name: 'MDX',
						type: 'prose',
						aliases: ['pandoc'],
						aceMode: 'markdown',
						codemirrorMode: 'gfm',
						codemirrorMimeType: 'text/x-gfm',
						wrap: true,
						extensions: ['.mdx'],
						filenames: [],
						tmScope: 'source.gfm',
						linguistLanguageId: 222,
						since: '1.15.0',
						parsers: ['mdx'],
						vscodeLanguageIds: ['mdx'],
					},
					{
						name: 'Angular',
						type: 'markup',
						tmScope: 'text.html.basic',
						aceMode: 'html',
						codemirrorMode: 'htmlmixed',
						codemirrorMimeType: 'text/html',
						color: '#e34c26',
						aliases: ['xhtml'],
						extensions: ['.component.html'],
						linguistLanguageId: 146,
						since: '1.15.0',
						parsers: ['angular'],
						vscodeLanguageIds: ['html'],
						filenames: [],
					},
					{
						name: 'HTML',
						type: 'markup',
						tmScope: 'text.html.basic',
						aceMode: 'html',
						codemirrorMode: 'htmlmixed',
						codemirrorMimeType: 'text/html',
						color: '#e34c26',
						aliases: ['xhtml'],
						extensions: [
							'.html',
							'.htm',
							'.html.hl',
							'.inc',
							'.st',
							'.xht',
							'.xhtml',
							'.mjml',
						],
						linguistLanguageId: 146,
						since: '1.15.0',
						parsers: ['html'],
						vscodeLanguageIds: ['html'],
					},
					{
						name: 'Lightning Web Components',
						type: 'markup',
						tmScope: 'text.html.basic',
						aceMode: 'html',
						codemirrorMode: 'htmlmixed',
						codemirrorMimeType: 'text/html',
						color: '#e34c26',
						aliases: ['xhtml'],
						extensions: [],
						linguistLanguageId: 146,
						since: '1.17.0',
						parsers: ['lwc'],
						vscodeLanguageIds: ['html'],
						filenames: [],
					},
					{
						name: 'Vue',
						type: 'markup',
						color: '#2c3e50',
						extensions: ['.vue'],
						tmScope: 'text.html.vue',
						aceMode: 'html',
						linguistLanguageId: 391,
						since: '1.10.0',
						parsers: ['vue'],
						vscodeLanguageIds: ['vue'],
					},
					{
						name: 'YAML',
						type: 'data',
						tmScope: 'source.yaml',
						aliases: ['yml'],
						extensions: [
							'.yml',
							'.mir',
							'.reek',
							'.rviz',
							'.sublime-syntax',
							'.syntax',
							'.yaml',
							'.yaml-tmlanguage',
							'.yml.mysql',
						],
						filenames: [
							'.clang-format',
							'.clang-tidy',
							'.gemrc',
							'glide.lock',
						],
						aceMode: 'yaml',
						codemirrorMode: 'yaml',
						codemirrorMimeType: 'text/x-yaml',
						linguistLanguageId: 407,
						since: '1.14.0',
						parsers: ['yaml'],
						vscodeLanguageIds: ['yaml'],
					},
				],
				options: [
					{
						name: 'arrowParens',
						since: '1.9.0',
						category: 'JavaScript',
						type: 'choice',
						default: 'avoid',
						description:
							'Include parentheses around a sole arrow function parameter.',
						choices: [
							{
								value: 'avoid',
								description:
									'Omit parens when possible. Example: `x => x`',
							},
							{
								value: 'always',
								description:
									'Always include parens. Example: `(x) => x`',
							},
						],
						pluginDefaults: {},
					},
					{
						name: 'bracketSpacing',
						since: '0.0.0',
						category: 'Common',
						type: 'boolean',
						default: true,
						description: 'Print spaces between brackets.',
						oppositeDescription:
							'Do not print spaces between brackets.',
						pluginDefaults: {},
					},
					{
						name: 'cursorOffset',
						since: '1.4.0',
						category: 'Special',
						type: 'int',
						default: -1,
						range: {
							start: -1,
							end: null,
							step: 1,
						},
						description:
							'Print (to stderr) where a cursor at the given position would move to after formatting.\nThis option cannot be used with --range-start and --range-end.',
						pluginDefaults: {},
					},
					{
						name: 'endOfLine',
						since: '1.15.0',
						category: 'Global',
						type: 'choice',
						default: 'auto',
						description: 'Which end of line characters to apply.',
						choices: [
							{
								value: 'auto',
								description:
									"Maintain existing\n(mixed values within one file are normalised by looking at what's used after the first line)",
							},
							{
								value: 'lf',
								description:
									'Line Feed only (\\n), common on Linux and macOS as well as inside git repos',
							},
							{
								value: 'crlf',
								description:
									'Carriage Return + Line Feed characters (\\r\\n), common on Windows',
							},
							{
								value: 'cr',
								description:
									'Carriage Return character only (\\r), used very rarely',
							},
						],
						pluginDefaults: {},
					},
					{
						name: 'filepath',
						since: '1.4.0',
						category: 'Special',
						type: 'path',
						description:
							'Specify the input filepath. This will be used to do parser inference.',
						pluginDefaults: {},
					},
					{
						name: 'htmlWhitespaceSensitivity',
						since: '1.15.0',
						category: 'HTML',
						type: 'choice',
						default: 'css',
						description: 'How to handle whitespaces in HTML.',
						choices: [
							{
								value: 'css',
								description:
									'Respect the default value of CSS display property.',
							},
							{
								value: 'strict',
								description:
									'Whitespaces are considered sensitive.',
							},
							{
								value: 'ignore',
								description:
									'Whitespaces are considered insensitive.',
							},
						],
						pluginDefaults: {},
					},
					{
						name: 'insertPragma',
						since: '1.8.0',
						category: 'Special',
						type: 'boolean',
						default: false,
						description:
							"Insert @format pragma into file's first docblock comment.",
						pluginDefaults: {},
					},
					{
						name: 'jsxBracketSameLine',
						since: '0.17.0',
						category: 'JavaScript',
						type: 'boolean',
						default: false,
						description:
							'Put > on the last line instead of at a new line.',
						pluginDefaults: {},
					},
					{
						name: 'jsxSingleQuote',
						since: '1.15.0',
						category: 'JavaScript',
						type: 'boolean',
						default: false,
						description: 'Use single quotes in JSX.',
						pluginDefaults: {},
					},
					{
						name: 'parser',
						since: '0.0.10',
						category: 'Global',
						type: 'choice',
						description: 'Which parser to use.',
						choices: [
							{
								value: 'flow',
								description: 'Flow',
							},
							{
								value: 'babel',
								since: '1.16.0',
								description: 'JavaScript',
							},
							{
								value: 'babel-flow',
								since: '1.16.0',
								description: 'Flow',
							},
							{
								value: 'typescript',
								since: '1.4.0',
								description: 'TypeScript',
							},
							{
								value: 'css',
								since: '1.7.1',
								description: 'CSS',
							},
							{
								value: 'less',
								since: '1.7.1',
								description: 'Less',
							},
							{
								value: 'scss',
								since: '1.7.1',
								description: 'SCSS',
							},
							{
								value: 'json',
								since: '1.5.0',
								description: 'JSON',
							},
							{
								value: 'json5',
								since: '1.13.0',
								description: 'JSON5',
							},
							{
								value: 'json-stringify',
								since: '1.13.0',
								description: 'JSON.stringify',
							},
							{
								value: 'graphql',
								since: '1.5.0',
								description: 'GraphQL',
							},
							{
								value: 'markdown',
								since: '1.8.0',
								description: 'Markdown',
							},
							{
								value: 'mdx',
								since: '1.15.0',
								description: 'MDX',
							},
							{
								value: 'vue',
								since: '1.10.0',
								description: 'Vue',
							},
							{
								value: 'yaml',
								since: '1.14.0',
								description: 'YAML',
							},
							{
								value: 'html',
								since: '1.15.0',
								description: 'HTML',
							},
							{
								value: 'angular',
								since: '1.15.0',
								description: 'Angular',
							},
							{
								value: 'lwc',
								since: '1.17.0',
								description: 'Lightning Web Components',
							},
						],
						pluginDefaults: {},
					},
					{
						name: 'pluginSearchDirs',
						since: '1.13.0',
						type: 'path',
						array: true,
						default: [],
						category: 'Global',
						description:
							'Custom directory that contains prettier plugins in node_modules subdirectory.\nOverrides default behavior when plugins are searched relatively to the location of Prettier.\nMultiple values are accepted.',
						pluginDefaults: {},
					},
					{
						name: 'plugins',
						since: '1.10.0',
						type: 'path',
						array: true,
						default: [],
						category: 'Global',
						description:
							'Add a plugin. Multiple plugins can be passed as separate `--plugin`s.',
						pluginDefaults: {},
					},
					{
						name: 'printWidth',
						since: '0.0.0',
						category: 'Global',
						type: 'int',
						default: 80,
						description:
							'The line length where Prettier will try wrap.',
						range: {
							start: 0,
							end: null,
							step: 1,
						},
						pluginDefaults: {},
					},
					{
						name: 'proseWrap',
						since: '1.8.2',
						category: 'Common',
						type: 'choice',
						default: 'preserve',
						description: 'How to wrap prose.',
						choices: [
							{
								since: '1.9.0',
								value: 'always',
								description:
									'Wrap prose if it exceeds the print width.',
							},
							{
								since: '1.9.0',
								value: 'never',
								description: 'Do not wrap prose.',
							},
							{
								since: '1.9.0',
								value: 'preserve',
								description: 'Wrap prose as-is.',
							},
						],
						pluginDefaults: {},
					},
					{
						name: 'quoteProps',
						since: '1.17.0',
						category: 'JavaScript',
						type: 'choice',
						default: 'consistent',
						description:
							'Change when properties in objects are quoted.',
						choices: [
							{
								value: 'as-needed',
								description:
									'Only add quotes around object properties where required.',
							},
							{
								value: 'consistent',
								description:
									'If at least one property in an object requires quotes, quote all properties.',
							},
							{
								value: 'preserve',
								description:
									'Respect the input use of quotes in object properties.',
							},
						],
						pluginDefaults: {},
					},
					{
						name: 'rangeEnd',
						since: '1.4.0',
						category: 'Special',
						type: 'int',
						default: null,
						range: {
							start: 0,
							end: null,
							step: 1,
						},
						description:
							'Format code ending at a given character offset (exclusive).\nThe range will extend forwards to the end of the selected statement.\nThis option cannot be used with --cursor-offset.',
						pluginDefaults: {},
					},
					{
						name: 'rangeStart',
						since: '1.4.0',
						category: 'Special',
						type: 'int',
						default: 0,
						range: {
							start: 0,
							end: null,
							step: 1,
						},
						description:
							'Format code starting at a given character offset.\nThe range will extend backwards to the start of the first line containing the selected statement.\nThis option cannot be used with --cursor-offset.',
						pluginDefaults: {},
					},
					{
						name: 'requirePragma',
						since: '1.7.0',
						category: 'Special',
						type: 'boolean',
						default: false,
						description:
							"Require either '@prettier' or '@format' to be present in the file's first docblock comment\nin order for it to be formatted.",
						pluginDefaults: {},
					},
					{
						name: 'semi',
						since: '1.0.0',
						category: 'JavaScript',
						type: 'boolean',
						default: true,
						description: 'Print semicolons.',
						oppositeDescription:
							'Do not print semicolons, except at the beginning of lines which may need them.',
						pluginDefaults: {},
					},
					{
						name: 'singleQuote',
						since: '0.0.0',
						category: 'Common',
						type: 'boolean',
						default: false,
						description:
							'Use single quotes instead of double quotes.',
						pluginDefaults: {},
					},
					{
						name: 'tabWidth',
						type: 'int',
						category: 'Global',
						default: 2,
						description: 'Number of spaces per indentation level.',
						range: {
							start: 0,
							end: null,
							step: 1,
						},
						pluginDefaults: {},
					},
					{
						name: 'trailingComma',
						since: '0.0.0',
						category: 'JavaScript',
						type: 'choice',
						default: 'none',
						description:
							'Print trailing commas wherever possible when multi-line.',
						choices: [
							{
								value: 'none',
								description: 'No trailing commas.',
							},
							{
								value: 'es5',
								description:
									'Trailing commas where valid in ES5 (objects, arrays, etc.)',
							},
							{
								value: 'all',
								description:
									'Trailing commas wherever possible (including function arguments).',
							},
						],
						pluginDefaults: {},
					},
					{
						name: 'useTabs',
						since: '1.0.0',
						category: 'Global',
						type: 'boolean',
						default: false,
						description: 'Indent with tabs instead of spaces.',
						pluginDefaults: {},
					},
					{
						name: 'vueIndentScriptAndStyle',
						since: '1.19.0',
						category: 'HTML',
						type: 'boolean',
						default: false,
						description:
							'Indent script and style tags in Vue files.',
						pluginDefaults: {},
					},
				],
			};
			/* eslint-enable sort-keys */
		}
	},

	resolveConfig(filepath, options = {}) {
		const prettier = prepare(filepath);

		if (prettier) {
			return prettier.resolveConfig(filepath, options);
		}
		else {
			return Promise.resolve(null);
		}
	},

	version: '2.1.2',
};

function getWorkspaceRoot(filepath) {
	let current = filepath;

	while (true) {
		const parent = path.dirname(current);

		const candidate = path.join(parent, 'settings.gradle');

		if (fs.existsSync(candidate)) {
			current = candidate;

			break;
		}
		else if (parent === current) {

			// Can't go any higher.

			return null;
		}
		else {
			current = parent;
		}
	}

	return path.dirname(current);
}

/**
 * Returns the root directory if `filepath` is inside a liferay-portal
 * checkout, otherwise returns null.
 */
function getPortalRoot(filepath) {

	// Walk up until we find portal-web (in the root).

	let current = filepath;

	while (true) {
		const parent = path.dirname(current);

		const candidate = path.join(parent, 'portal-web');

		if (fs.existsSync(candidate)) {
			current = candidate;

			break;
		}
		else if (parent === current) {

			// Can't go any higher.

			return null;
		}
		else {
			current = parent;
		}
	}

	// Confirm that this really is liferay-portal by looking down.

	if (fs.existsSync(path.join(current, 'docroot/WEB-INF/liferay-web.xml'))) {
		return path.dirname(current);
	}
	else {
		return null;
	}
}

/**
 * Returns the root directory if `filepath` is inside a
 * liferay-frontend-projects checkout, otherwise returns null.
 */
function getFrontendProjectsRoot(filepath) {
	let current = filepath;

	// Walk up until we find marker file (indicating the root).

	while (true) {
		const parent = path.dirname(current);

		const candidate = path.join(parent, '.liferay-frontend-projects');

		if (fs.existsSync(candidate)) {
			return parent;
		}
		else if (parent === current) {

			// Can't go any higher.

			return null;
		}
		else {
			current = parent;
		}
	}
}

/**
 * Hack because current working directory will usually be "/" in
 * the context of a VSCode extension, which means that our require
 * statements won't work: liferay-portal's node_modules folder is
 * obviously not at "/", and the extension's is generally hidden
 * somewhere under "~/.vscode/extensions".
 */
function prepare(filepath) {
	if (!filepath) {
		return prettier;
	}

	const cwd = process.cwd();

	let dir = '.';

	let file = 'prettier';

	const workspaceRoot = getWorkspaceRoot(filepath);
	const portalRoot = getPortalRoot(filepath);

	const portalOrWorkspaceRoot =
		getPortalRoot(filepath) || getWorkspaceRoot(filepath);

	let modules;

	if (workspaceRoot) {
		modules = path.join(workspaceRoot, 'node_modules');
	}

	if (portalRoot) {
		modules = path.join(portalRoot, 'modules/node_modules');
	}

	if (portalOrWorkspaceRoot) {
		let scripts = path.join(modules, '@liferay/npm-scripts');

		let wrapper = path.join(scripts, 'src/scripts/prettier.js');

		if (!fs.existsSync(wrapper)) {
			scripts = path.join(modules, 'liferay-npm-scripts');

			wrapper = path.join(scripts, 'src/scripts/prettier.js');
		}

		const fallback = path.join(modules, 'prettier/bin-prettier.js');

		if (fs.existsSync(wrapper)) {
			dir = scripts;
			file = wrapper;
		}
		else if (fs.existsSync(fallback)) {
			dir = modules;
			file = fallback;
		}
	}

	const frontendProjectsRoot = getFrontendProjectsRoot(filepath);

	if (frontendProjectsRoot) {
		const scripts = path.join(
			frontendProjectsRoot,
			'projects/npm-tools/packages/npm-scripts'
		);

		const wrapper = path.join(scripts, 'src/scripts/prettier.js');

		if (fs.existsSync(wrapper)) {
			dir = scripts;
			file = wrapper;
		}
	}
	else {
		const extension = require('vscode').extensions.getExtension(
			'esbenp.prettier-vscode'
		);

		if (extension) {
			dir = path.join(extension.extensionPath);
			file = path.join(dir, 'node_modules/prettier');
		}
	}

	try {
		process.chdir(dir);

		// eslint-disable-next-line @liferay/no-dynamic-require
		prettier = require(file);
	}
	catch (_error) {

		// All hope is lost.

	}
	finally {
		process.chdir(cwd);
	}

	return prettier;
}
