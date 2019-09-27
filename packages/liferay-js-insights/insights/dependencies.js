/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

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
function extractImports(ast) {
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

	function getGroup(source) {
		return SOURCE_GROUPS[
			SOURCE_GROUPS.findIndex(group => group.test(source))
		];
	}

	const externalImports = ast.program.body.filter(
		node =>
			node.type === 'ImportDeclaration' &&
			/^[a-z@]/i.test(node.source.value)
	);

	const data = {};

	SOURCE_GROUPS.forEach(group => {
		data[group.name] = [];
	});

	return {
		count: externalImports.length,
		dependencies: externalImports.reduce((imports, node) => {
			const groupName = getGroup(node.source.value).name;

			imports[groupName] = [
				...imports[groupName],
				node.specifiers
					.filter(specifier => specifier.local.name)
					.map(specifier => specifier.local.name)
			].reduce((memo, it) => memo.concat(it), []); // Not using flatMap to support Node.js 10;;;

			return imports;
		}, data)
	};
}

/**
 * Augments a provided insights report with information about the dependencies
 * of the given module ast.
 */
module.exports = async function(ast, insights) {
	const {count, dependencies} = extractImports(ast);

	if (count) {
		return {
			...insights,
			dependencies
		};
	}

	return insights;
};
