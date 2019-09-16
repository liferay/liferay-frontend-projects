/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Fast permutaton generation using "Heap's method".
 *
 * @see https://stackoverflow.com/a/37580979/2103996
 * @see http://homepage.math.uiowa.edu/~goodman/22m150.dir/2007/Permutation%20Generation%20Methods.pdf
 */
function permute([...permutation]) {
	const length = permutation.length;
	const result = [[...permutation]];
	const c = new Array(length).fill(0);
	let k;
	let i = 1;
	let p;

	while (i < length) {
		if (c[i] < i) {
			k = i % 2 && c[i];
			p = permutation[i];
			permutation[i] = permutation[k];
			permutation[k] = p;
			++c[i];
			i = 1;
			result.push([...permutation]);
		} else {
			c[i] = 0;
			++i;
		}
	}
	return result;
}

module.exports = permute;
