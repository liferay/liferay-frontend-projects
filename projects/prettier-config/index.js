/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

import * as liferayPlugin from '@liferay/prettier-plugin';
import pluginBraceStyle from 'prettier-plugin-brace-style';

export default {
	braceStyle: 'stroustrup',
	bracketSpacing: false,
	endOfLine: 'lf',
	jsxSingleQuote: false,
	plugins: [pluginBraceStyle, liferayPlugin],
	quoteProps: 'consistent',
	singleQuote: true,
	tabWidth: 4,
	trailingComma: 'es5',
	useTabs: true,
};
