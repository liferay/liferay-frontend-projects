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
 *  - react
 *  - js
 *  - metal
 *  - clay2
 *  - others
 */
function extractImports(ast) {
	const EMPTY = [[], [], [], [], [], []];
	const SOURCE_GROUPS = [
		source => source.startsWith('@clayui'),
		source =>
			source.startsWith('react') ||
			source.startsWith('prop-types') ||
			source.startsWith('classnames'),
		source => source.startsWith('frontend-js-web'),
		source => source.startsWith('metal-') || source === 'metal',
		source => source.startsWith('clay-') || source === 'clay',
		_ => true // eslint-disable-line
	];

	function getGroup(source) {
		return SOURCE_GROUPS.findIndex(group => group(source));
	}

	const externalImports = ast.program.body.filter(
		node =>
			node.type === 'ImportDeclaration' &&
			/^[a-z@]/i.test(node.source.value)
	);

	return [
		externalImports.length,
		...(externalImports.reduce((imports, node) => {
			const group = getGroup(node.source.value);

			imports[group] = [
				...imports[group],
				node.specifiers
					.filter(specifier => specifier.local.name)
					.map(specifier => specifier.local.name)
			].reduce((memo, it) => memo.concat(it), []); // Not using flatMap to support Node.js 10;;;

			return imports;
		}, EMPTY) || EMPTY)
	];
}

/**
 *
 */
module.exports = async function(ast, insights) {
	const [count, clay3, react, js, metal, clay2, others] = extractImports(ast);

	if (count) {
		return {
			...insights,
			dependencies: {
				clay2,
				clay3,
				js,
				metal,
				others,
				react
			}
		};
	}

	return insights;
};
