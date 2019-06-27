/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

module.exports = {
	meta: {
		docs: {
			description:
				'jQuery `sideNavigation` plugin is deprecated; use Liferay.SideNavigation instead',
			category: 'Deprecated APIs',
			recommended: false,
			url: 'https://issues.liferay.com/browse/LPS-96486',
		},
		fixable: null,
		messages: {
			noDataToggleSidenav:
				'data-toggle="sidenav" is deprecated; use data-toggle="liferay-sidenav" instead',
			noSideNavigation:
				'sideNavigation() is deprecated; use Liferay.SideNavigation() instead',
		},
		schema: [],
		type: 'problem',
	},

	create(context) {
		return {
			JSXAttribute(node) {
				if (
					node.type === 'JSXAttribute' &&
					node.name.type === 'JSXIdentifier' &&
					node.name.name === 'data-toggle' &&
					node.value &&
					node.value.type === 'Literal' &&
					typeof node.value.value === 'string' &&
					node.value.value.match(/^\s*sidenav\s*$/)
				) {
					context.report({
						messageId: 'noDataToggleSidenav',
						node,
					});
				}
			},

			CallExpression(node) {
				if (
					node.callee.type === 'MemberExpression' &&
					node.callee.property &&
					node.callee.property.type === 'Identifier' &&
					node.callee.property.name === 'sideNavigation'
				) {
					context.report({
						messageId: 'noSideNavigation',
						node,
					});
				}
			},
		};
	},
};
