/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const DEPRECATED_MODULES = [
	'metal-ajax',
	'metal-aop',
	'metal-clipboard',
	'metal-debounce',
	'metal-keyboard-focus',
	'metal-promise',
	'metal-storage',
	'metal-structs',
	'metal-uri',
	'metal-useragent',
];

module.exports = {
	create(context) {
		return {
			ImportDeclaration(node) {
				if (
					node.source &&
					node.source.type === 'Literal' &&
					DEPRECATED_MODULES.includes(node.source.value)
				) {
					context.report({
						messageId: `no-${node.source.value}`,
						node,
					});
				}
			},
		};
	},

	meta: {
		docs: {
			category: 'Deprecated APIs',
			description:
				'metal-plugins are deprecated; use local utilities instead',
			recommended: false,
			url: 'https://issues.liferay.com/browse/LPS-96715',
		},
		fixable: null,
		messages: {
			'no-metal-ajax':
				"metal-ajax is deprecated; use `import {fetch} from 'frontend-js-web';` instead",
			'no-metal-aop':
				"metal-aop is deprecated; use `import {AOP} from 'frontend-js-web';` instead",
			'no-metal-clipboard':
				'metal-clipboard is deprecated; use ClipboardJS instead',
			'no-metal-debounce':
				"metal-debounce is deprecated; use `import {debounce} from 'frontend-js-web';` instead",
			'no-metal-keyboard-focus':
				"metal-keyboard-focus is deprecated; use `import {debounce} from 'frontend-js-web';` instead",
			'no-metal-promise':
				'metal-promise is deprecated; use native Promise instead',
			'no-metal-storage':
				'metal-storage is deprecated; use a local implementation instead',
			'no-metal-structs':
				'metal-structs is deprecated; use plain objects instead',
			'no-metal-uri': 'metal-uri is deprecated; use native URL instead',
			'no-metal-useragent':
				'metal-useragent is deprecated; use `Liferay.Browser` instead',
		},
		schema: [],
		type: 'problem',
	},
};
