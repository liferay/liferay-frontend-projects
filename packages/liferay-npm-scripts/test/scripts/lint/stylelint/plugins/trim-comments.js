/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

describe('liferay/trim-comments', () => {
	const plugin = 'liferay/trim-comments';

	it('accepts trimmed comments', async () => {
		await expect(plugin).toLintStyles({
			code: `
				// Here is a nice comment.
				// More.
				a { color: #000; }
			`,
			errors: []
		});
	});

	it('reports comments with leading blank lines', async () => {
		await expect(plugin).toLintStyles({
			code: `
				//
				// That blank is no good.
				a { color: #000; }

				//    
				// That one is bad too and additionally has trailing whitespace.
				a { color: #fff; }
			`,
			errors: [
				{
					column: 5,
					line: 2,
					rule: 'liferay/trim-comments',
					severity: 'error',
					text:
						'No blank leading lines in comments (liferay/trim-comments)'
				},
				{
					column: 5,
					line: 6,
					rule: 'liferay/trim-comments',
					severity: 'error',
					text:
						'No blank leading lines in comments (liferay/trim-comments)'
				}
			]
		});
	});

	it('reports comments with trailing blank lines', async () => {
		await expect(plugin).toLintStyles({
			code: `
				// Following blank is no good.
				//
				a { color: #000; }

				// Next one is bad too and additionally has trailing whitespace.
				//    
				a { color: #fff; }
			`,
			errors: [
				{
					column: 5,
					line: 3,
					rule: 'liferay/trim-comments',
					severity: 'error',
					text:
						'No blank trailing lines in comments (liferay/trim-comments)'
				},
				{
					column: 5,
					line: 7,
					rule: 'liferay/trim-comments',
					severity: 'error',
					text:
						'No blank trailing lines in comments (liferay/trim-comments)'
				}
			]
		});
	});

	it('reports comments with leading and trailing blank lines', async () => {
		await expect(plugin).toLintStyles({
			code: `
				//
				// These blanks are no good.
				//
				a { color: #000; }
			`,
			errors: [
				{
					column: 5,
					line: 2,
					rule: 'liferay/trim-comments',
					severity: 'error',
					text:
						'No blank leading lines in comments (liferay/trim-comments)'
				},
				{
					column: 5,
					line: 4,
					rule: 'liferay/trim-comments',
					severity: 'error',
					text:
						'No blank trailing lines in comments (liferay/trim-comments)'
				}
			]
		});
	});

	it('autofixes', async () => {
		await expect(plugin).toLintStyles({
			code: `
				//
				// A bad lonely comment.
				//

				//
				// These blanks are no good.
				//
				a { color: #000; }

				//
				// Also not good.
				//
				a { color: #111; }

				//
				// One last bad thing.
				//
			`,
			errors: [],
			output: `
				// A bad lonely comment.

				// These blanks are no good.
				a { color: #000; }

				// Also not good.
				a { color: #111; }

				// One last bad thing.
			`
		});
	});

	it('can be turned off', async () => {
		await expect(plugin).toLintStyles({
			code: `
				//
				// These blanks are no good.
				//
				a { color: #000; }
			`,
			errors: [],
			options: [false]
		});
	});
});
