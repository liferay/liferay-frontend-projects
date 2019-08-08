/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
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

const toCamelCase = input => {
	return input
		.replace(/^[_.\- ]+/, '')
		.toLowerCase()
		.replace(/[_.\- ]+(\w|$)/g, (_, p1) => p1.toUpperCase())
		.replace(/\d+(\w|$)/g, m => m.toUpperCase());
};

module.exports = {
	meta: {
		docs: {
			description:
				'metal-plugins are deprecated; use local utilities instead',
			category: 'Deprecated APIs',
			recommended: false,
			url: 'https://issues.liferay.com/browse/LPS-96715',
		},
		fixable: null,
		messages: {
			noMetalAjax:
				"metal-ajax is deprecated; use `import {fetch} from 'frontend-js-web';` instead",
			noMetalAop:
				"metal-aop is deprecated; use `import {AOP} from 'frontend-js-web';` instead",
			noMetalClipboard:
				'metal-clipboard is deprecated; use ClipboardJS instead',
			noMetalDebounce:
				"metal-debounce is deprecated; use `import {debounce} from 'frontend-js-web';` instead",
			noMetalKeyboardFocus:
				"metal-keyboard-focus is deprecated; use `import {debounce} from 'frontend-js-web';` instead",
			noMetalPromise:
				'metal-promise is deprecated; use native Promise instead',
			noMetalStorage:
				'metal-storage is deprecated; use a local implementation instead',
			noMetalStructs:
				'metal-structs is deprecated; use plain objects instead',
			noMetalUri: 'metal-uri is deprecated; use native URL instead',
			noMetalUseragent:
				'metal-useragent is deprecated; use `Liferay.Browser` instead',
		},
		schema: [],
		type: 'problem',
	},

	create(context) {
		return {
			ImportDeclaration(node) {
				if (
					node.source &&
					node.source.type === 'Literal' &&
					DEPRECATED_MODULES.includes(node.source.value)
				) {
					context.report({
						messageId: toCamelCase(`no-${node.source.value}`),
						node,
					});
				}
			},
		};
	},
};
