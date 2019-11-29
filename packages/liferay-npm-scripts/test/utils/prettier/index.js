/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const config = require('../../../src/config/prettier.json');
const prettier = require('../../../src/utils/prettier');
const dedent = require('../../../support/dedent');

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
				filepath: 'some/directory/__sample__.js',
				...options
			});
		}

		it('does not choke on SCSS files', () => {
			expect(
				format(
					code`
					@mixin button-base()
					{
						@include typography(button);
						@include ripple-surface;
						@include ripple-radius-bounded;

						display: inline-flex;
						position: relative;
						height: $button-height;
						border: none;
						vertical-align: middle;

						&:hover { cursor: pointer; }

						&:disabled
						{
							color: $mdc-button-disabled-ink-color;
							cursor: default;
							pointer-events: none;
						}
					}
			`,
					{
						filepath: 'some/directory/__sample__.scss'
					}
				)
			).toBe(code`
					@mixin button-base() {
						@include typography(button);
						@include ripple-surface;
						@include ripple-radius-bounded;

						display: inline-flex;
						position: relative;
						height: $button-height;
						border: none;
						vertical-align: middle;

						&:hover {
							cursor: pointer;
						}

						&:disabled {
							color: $mdc-button-disabled-ink-color;
							cursor: default;
							pointer-events: none;
						}
					}
			`);
		});

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

			it('preserves inline comments before alternates', () => {
				// Prettier does some "crazy" things with comments (moving them
				// in and out of blocks) but this is one case where it leaves
				// them alone.
				expect(
					format(code`
						if (test) {
							a();
						} /* comment */ else {
							b();
						}
				`)
				).toBe(code`
						if (test) {
							a();
						} /* comment */
						else {
							b();
						}
				`);
			});

			it('preserves alone-on-a-line comments before alternates', () => {
				// This is a regression test.
				//
				// Given JSP source like this:
				//
				//      if (test) {
				//          a();
				//      }
				//      <c:if test="<%= value %>">
				//          else {
				//              b();
				//          }
				//      </c:if>
				//
				// We will transform that to source (roughly) like this before
				// formatting it:
				//
				//      if (test) {
				//          a();
				//      }
				//      // opening JSP tag comment
				//      else {
				//          b();
				//      }
				//      // closing JSP tag comment
				//
				// We were incorrectly stripping the comment before the
				// alternate (ie. the first one).
				expect(
					format(code`
						if (test) {
							a();
						}
						// opening JSP tag comment
						else if (x) {
							b();
						}
						// closing JSP tag comment
				`)
				).toBe(code`
						if (test) {
							a();
						}
						// opening JSP tag comment
						else if (x) {
							b();
						}
						// closing JSP tag comment
				`);
			});

			it('does not re-fix alternates that are already correct', () => {
				// Prettier will first move the "else" here back onto
				// the preceding line, then our wrapper moves it back down
				// again.
				expect(
					format(code`
						if (test) {
							a();
						}
						else {
							b();
						}
				`)
				).toBe(code`
						if (test) {
							a();
						}
						else {
							b();
						}
				`);
			});

			it('breaks before "catch" (with catch binding)', () => {
				expect(
					format(code`
						try {
							a();
						} catch (error) {
							log(error);
						}
				`)
				).toBe(code`
						try {
							a();
						}
						catch (error) {
							log(error);
						}
				`);
			});

			// Disabled until we switch our ESLint ecmaVersion to '2019'.
			it.skip('breaks before "catch" (without optional catch binding)', () => {
				expect(
					format(code`
						try {
							b();
						} catch {
							c();
						}
				`)
				).toBe(code`
						try {
							b();
						}
						catch {
							c();
						}
				`);
			});

			it('breaks before "finally" (after a "catch" handler)', () => {
				expect(
					format(code`
						try {
							a();
						} catch (error) {
							log(error);
						} finally {
							dispose();
						}
				`)
				).toBe(code`
						try {
							a();
						}
						catch (error) {
							log(error);
						}
						finally {
							dispose();
						}
				`);
			});

			it('breaks before "finally" (when no "catch" handler)', () => {
				expect(
					format(code`
						try {
							a();
						} finally {
							dispose();
						}
				`)
				).toBe(code`
						try {
							a();
						}
						finally {
							dispose();
						}
				`);
			});

			it('copes with comments near "try"/"catch" constructs', () => {
				// Note: the movement of "comment 2" below is Prettier
				// craziness and not the fault of our post-processor.
				expect(
					format(code`
						try {
							a();
						} /* comment 1 */ catch /* comment 2 */ (error) {
							log(error);
						} /* comment 3 */ finally /* comment 4 */ {
							dispose();
						}
				`)
				).toBe(code`
						try {
							a();
						} /* comment 1 */
						catch (/* comment 2 */ error) {
							log(error);
						} /* comment 3 */
						finally /* comment 4 */ {
							dispose();
						}
				`);
			});

			it('copes with import statements', () => {
				expect(
					format(code`
						import {a, b} from './a';

						if (test) {
							a();
						} else {
							b();
						}
				`)
				).toBe(code`
						import {a, b} from './a';

						if (test) {
							a();
						}
						else {
							b();
						}
				`);
			});
		});
	});
});
