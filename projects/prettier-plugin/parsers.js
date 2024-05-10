/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

import {format} from 'prettier';
import {parsers as babelParsers} from 'prettier/plugins/babel';
import {parsers as typescriptParsers} from 'prettier/plugins/typescript';

import {linesAroundComments} from './rules/lines-around-comments.js';

function transformParser(parserName, defaultParser) {
	return {
		...defaultParser,
		astFormat: 'liferay-style-ast',
		parse: async (text, options) => {

			/*
			 * We need to filter out our own plugin before calling default prettier
			 */
			const plugins = options.plugins.filter(
				(plugin) => !plugin.printers['liferay-style-ast']
			);

			let formattedText = await format(text, {
				...options,
				plugins,
			});

			const ast = defaultParser.parse(formattedText, options);

			formattedText = linesAroundComments(formattedText, ast, parserName);

			return {
				body: formattedText,
				type: 'FormattedText',
			};
		},
	};
}

export const parsers = {
	babel: transformParser('babel', babelParsers.babel),
	typescript: transformParser('typescript', typescriptParsers.typescript),
};
