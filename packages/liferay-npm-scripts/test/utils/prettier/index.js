/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const prettier = require('../../../src/utils/prettier');
const dedent = require('../../../support/dedent');
const config = require('../../../src/config/prettier.json');

/**
 * Helper function to make code samples in this file a little more readable:
 *
 * - Strips leading and trailing blank lines.
 * - Uses the `dedent()` helper to reduce excess indentation that comes from
 *   template literals.
 * - Ensures trailing linefeed.
 */
function code(strings, ...interpolations) {
	if (interpolations.length) {
		throw new Error(
			'`code` tagged template literal does not support interpolation'
		);
	}

	// Remove leading and trailing blank lines.
	const trimmed = strings[0].replace(/^\n/, '').trimEnd();

	let minimumIndent = null;

	const raw = trimmed.replace(/^(\t*)[^\t]/g, (match, tabs) => {
		if (minimumIndent !== null) {
			minimumIndent = Math.min(minimumIndent, tabs.length);
		} else if (tabs.length) {
			minimumIndent = tabs.length;
		}

		return match;
	});

	return dedent(minimumIndent || 0)([raw]) + '\n';
}

describe('code``', () => {
	it('formats the empty string', () => {
		expect(code``).toBe('\n');
	});

	it('dedents a single line', () => {
		expect(code`hey`).toBe('hey\n');
		expect(code`\tthere`).toBe('there\n');
	});

	it('dedents multiple lines', () => {
		expect(code`\tone\n\t\ttwo`).toBe(`one\n\ttwo\n`);
	});

	it('ignores blank lines', () => {
		expect(code`\tone\n\n\t\ttwo`).toBe(`one\n\n\ttwo\n`);
	});

	it('trims leading and trailing blank lines', () => {
		expect(code`
			foo

				bar
		`).toBe(`foo\n\n\tbar\n`);
	});
});

describe('utils/prettier/index.js', () => {
	describe('prettier.format()', () => {
		function format(source, options = {}) {
			return prettier.format(source, {
				...config,
				filepath: `sample.js`,
				...options
			});
		}

		// TODO: make sure this doesn't freak out when we pass in scss files

		it('does standard prettier formatting', () => {
			expect(
				format(code`
					if (test) { exit(); }
			`)
			).toBe(code`
				if (test) {
					exit();
				}
			`);
		});

		describe('new-line-before-block-statements', () => {
			it('breaks before "else"', () => {
				expect(
					format(code`
						// Random ES6 to prove that custom lint rule can handle
						// it without choking.
						const arrow = () => {};

						function thing() {
							if (test) {
								return 1;
							} else {
								return 2;
							}
						}
				`)
				).toBe(code`
					// Random ES6 to prove that custom lint rule can handle
					// it without choking.
					const arrow = () => {};

					function thing() {
						if (test) {
							return 1;
						}
						else {
							return 2;
						}
					}
				`);
			});

			it('breaks before "else if"', () => {
				expect(
					format(code`
						function thing() {
							if (test) {
								return 1;
							} else if (other) {
								return 2;
							} else {
								return 3;
							}
						}
				`)
				).toBe(code`
					function thing() {
						if (test) {
							return 1;
						}
						else if (other) {
							return 2;
						}
						else {
							return 3;
						}
					}
				`);
			});
		});
	});
});
