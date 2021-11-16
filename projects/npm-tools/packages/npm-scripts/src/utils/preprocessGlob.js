/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Tools like Prettier and ESLint support a narrow version of globbing (like the
 * one described in `man 5 gitignore`) for use in "ignore" files, and a broader
 * version with some additional features (such as support for "{a,b}"
 * variations) on the command-line.
 *
 * This function takes an "extended" glob (that may contain "{a,b}" sequences)
 * and turns it into an array of one or more globs corresponding to the
 * variations.
 */
function preprocessGlob(glob) {

	// This function considers each "{}" to be a "hole" in the template (the
	// glob), to be filled in with permutations of the substitutions defined
	// inside the braces.

	const template = [''];
	const substitutions = [];

	let bracketCount = 0;

	for (let i = 0; i < glob.length; i++) {
		const char = glob[i];

		if (char === '{') {
			bracketCount++;

			if (bracketCount > 1) {
				throw new Error(`Nested "{" found in glob \`${glob}\``);
			}

			substitutions.push('');
		}
		else if (char === '}') {
			bracketCount--;

			if (bracketCount !== 0) {
				throw new Error(`Unbalanced "}" found in glob \`${glob}\``);
			}

			const index = substitutions.length - 1;

			if (substitutions[index] === '') {

				// There were no substitutions at all; braces are literal.

				substitutions.pop();
				template[template.length - 1] += '{}';
			}
			else {
				substitutions[index] = substitutions[index].split(',');
				template.push('');
			}
		}
		else if (bracketCount === 0) {

			// We are capturing normal text.

			const index = template.length - 1;

			template[index] = template[index] + char;
		}
		else {

			// We are capturing substitution(s).

			const index = substitutions.length - 1;

			substitutions[index] += char;
		}
	}

	if (bracketCount) {
		throw new Error(`Unbalanced "{" found in glob \`${glob}\``);
	}

	return fill(template, substitutions);
}

function fill(template, substitutions) {
	const [first, ...rest] = template;

	if (!rest.length && !substitutions.length) {

		// Recursion base case (nothing left to substitute).

		return [first];
	}

	const permutations = [];

	(substitutions[0] || []).forEach((substitution) => {
		permutations.push(
			...fill(rest, substitutions.slice(1)).map(
				(result) => first + substitution + result
			)
		);
	});

	return permutations;
}

module.exports = preprocessGlob;
