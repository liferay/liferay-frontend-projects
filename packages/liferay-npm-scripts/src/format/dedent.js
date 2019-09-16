/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Trims leading and trailing whitespace from the `input` string and
 * reduces the indent level back to column 0.
 */
function dedent(input, tabWidth = 4) {
	// Collapse totally blank lines to empty strings.
	const lines = input.split('\n').map(line => {
		if (line.match(/^\s+$/)) {
			return '';
		} else {
			return line;
		}
	});

	// Find minimum indent (ignoring empty lines).
	const minimum = lines.reduce((acc, line) => {
		const indent = line.match(/^\s+/);

		if (indent) {
			const length = Array.from(indent[0]).reduce((count, char) => {
				if (char === '\t') {
					return count + tabWidth;
				} else {
					return count + 1;
				}
			}, 0);
			return Math.min(acc, length);
		}

		return acc;
	}, Infinity);

	// Strip out minimum indent from every line.
	const dedented = isFinite(minimum)
		? lines.map(line => {
				const [, whitespace, rest] = line.match(/^(\s*)(.*)/);

				if (whitespace.length) {
					// Remove leftmost character until hitting desired length;
					// if you overshoot (due to a tab), pad with spaces.
					const chars = Array.from(whitespace);

					let trimmedLength = 0;

					while (chars.length) {
						const char = chars.shift();

						trimmedLength += char === '\t' ? tabWidth : 1;

						if (trimmedLength > minimum) {
							return (
								chars.join('') +
								' '.repeat(trimmedLength - minimum) +
								rest
							);
						} else if (trimmedLength === minimum) {
							return chars.join('') + rest;
						}
					}
				} else {
					return line;
				}
		  })
		: lines;

	// Trim first and last line if empty.
	if (dedented[0] === '') {
		dedented.shift();
	}

	if (dedented[dedented.length - 1] === '') {
		dedented.pop();
	}

	// Allow caller to check for last-found minimum.
	dedent.lastMinimum = isFinite(minimum) ? Math.floor(minimum / tabWidth) : 0;

	return dedented.join('\n');
}

module.exports = dedent;
