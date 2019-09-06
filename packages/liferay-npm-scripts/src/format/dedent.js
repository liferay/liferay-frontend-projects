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
			const length = indent[0].length;
			return Math.min(acc, length);
		}
		return acc;
	}, Infinity);

	// Strip out minimum indent from every line.
	const dedented = isFinite(minimum)
		? lines.map(line =>
				line.replace(new RegExp(`^${' '.repeat(minimum)}`, 'g'), '')
		  )
		: lines;

	// Trim first and last line if empty.
	if (dedented[0] === '') {
		dedented.shift();
	}
	if (dedented[dedented.length - 1] === '') {
		dedented.pop();
	}
	return dedented.join('\n');
}

module.exports = dedent;
