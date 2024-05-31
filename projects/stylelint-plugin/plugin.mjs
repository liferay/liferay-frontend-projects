/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

import stylelint from 'stylelint';

import noBlockComments from './rules/no-block-comments.mjs';
import noImportExtension from './rules/no-import-extension.mjs';
import singleImports from './rules/single-imports.mjs';
import sortImports from './rules/sort-imports.mjs';
import trimComments from './rules/trim-comments.mjs';

const rulesPlugins = [
	noBlockComments,
	noImportExtension,
	singleImports,
	sortImports,
	trimComments,
].map((rule) => stylelint.createPlugin(rule.ruleName, rule));

export default rulesPlugins;
