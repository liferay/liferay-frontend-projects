/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const traverse = require('@babel/traverse').default;

const SOURCE_GROUPS = [
	{
		name: 'clay3',
		test: source => source.startsWith('@clayui')
	},
	{
		name: 'react',
		test: source =>
			source.startsWith('react') ||
			source.startsWith('prop-types') ||
			source.startsWith('classnames')
	},
	{
		name: 'js',
		test: source => source.startsWith('frontend-js-web')
	},
	{
		name: 'metal',
		test: source => source.startsWith('metal-') || source === 'metal'
	},
	{
		name: 'clay2',
		test: source => source.startsWith('clay-') || source === 'clay'
	},
	{
		name: 'others',
		test: source => true // eslint-disable-line
	}
];

/**
 * Extracts import declarations from a given AST applying the following transforms:
 * - Relative imports are discarded
 * - Imports are grouped per origin into:
 * 	- clay3
 *  - clay2
 *  - js
 *  - metal
 *  - others
 *  - react
 */
module.exports = async function({ast}) {
	const dependencies = SOURCE_GROUPS.reduce((deps, group) => {
		deps[group.name] = [];

		return deps;
	}, {});

	traverse(ast, {
		ImportDeclaration({node}) {
			const {name} = SOURCE_GROUPS.find(group =>
				group.test(node.source.value)
			);

			dependencies[name] = [
				...dependencies[name],
				node.specifiers
					.filter(specifier => specifier.local.name)
					.map(specifier => specifier.local.name)
			].reduce((memo, it) => memo.concat(it), []); // Not using flatMap to support Node.js 10;;;
		}
	});

	return dependencies;
};
