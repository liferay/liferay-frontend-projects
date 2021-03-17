/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const DEPRECATED_MODULES = [
	'metal-affix',
	'metal-ajax',
	'metal-anim',
	'metal-aop',
	'metal-assertions',
	'metal-clipboard',
	'metal-debounce',
	'metal-dom',
	'metal-key',
	'metal-keyboard-focus',
	'metal-multimap',
	'metal-path-parser',
	'metal-position',
	'metal-promise',
	'metal-scrollspy',
	'metal-storage',
	'metal-structs',
	'metal-throttle',
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
			'no-metal-affix':
				'metal-affix is deprecated; use native offset instead',
			'no-metal-ajax':
				"metal-ajax is deprecated; use `import {fetch} from 'frontend-js-web';` instead",
			'no-metal-anim':
				'metal-anim is deprecated; use native `window.requestAnimationFrame()` instead',
			'no-metal-aop':
				"metal-aop is deprecated; use `import {AOP} from 'frontend-js-web';` instead",
			'no-metal-assertions':
				'metal-assertions is deprecated; use native `typeof` instead',
			'no-metal-clipboard':
				'metal-clipboard is deprecated; use ClipboardJS instead',
			'no-metal-debounce':
				"metal-debounce is deprecated; use `import {debounce} from 'frontend-js-web';` instead",
			'no-metal-dom':
				'metal-dom is deprecated; see https://issues.liferay.com/browse/LPS-122383 to learn what to use instead',
			'no-metal-key':
				'metal-key is deprecated; use native key event handling instead',
			'no-metal-keyboard-focus':
				'metal-keyboard-focus is deprecated; use native focus behaviour instead',
			'no-metal-multimap':
				'metal-multimap is deprecated; use native Set instead',
			'no-metal-path-parser':
				'metal-path-parser is deprecated; use native string manipulation instead',
			'no-metal-position':
				"metal-position is deprecated; use `import {ALIGN_POSITIONS, align} from 'frontend-js-web';` instead",
			'no-metal-promise':
				'metal-promise is deprecated; use native Promise instead',
			'no-metal-scrollspy':
				'metal-scrollspy is deprecated; use native scroll instead',
			'no-metal-storage':
				'metal-storage is deprecated; use a local implementation instead',
			'no-metal-structs':
				'metal-structs is deprecated; use plain objects instead',
			'no-metal-throttle':
				"metal-throttle is deprecated; `import {throttle} from 'frontend-js-web';` instead",
			'no-metal-uri': 'metal-uri is deprecated; use native URL instead',
			'no-metal-useragent':
				'metal-useragent is deprecated; use `Liferay.Browser` instead',
		},
		schema: [],
		type: 'problem',
	},
};
