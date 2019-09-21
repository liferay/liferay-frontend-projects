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
		source => source.includes('@clayui'),
		source =>
			source.includes('react') ||
			source.includes('prop-types') ||
			source.includes('classnames'),
		source => source.includes('frontend-js-web'),
		source => source.includes('metal-') || source === 'metal',
		source => source.includes('clay-') || source === 'clay',
		_ => true // eslint-disable-line
	];

	function getGroup(source) {
		return SOURCE_GROUPS.findIndex(group => group(source));
	}

	const externalImports = ast.program.body.filter(
		node =>
			node.type === 'ImportDeclaration' &&
			!node.source.value.includes('./')
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
