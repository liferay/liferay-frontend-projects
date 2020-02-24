/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

describe('liferay/no-block-comments', () => {
	const plugin = 'liferay/no-block-comments';

	it('accepts line-based comments', async () => {
		await expect(plugin).toLintStyles({
			code: `
				// A good comment.
				a { color: #000 };
			`,
			errors: []
		});
	});

	it('reports block-based comments as errors', async () => {
		await expect(plugin).toLintStyles({
			code: `
				/* A bad comment. */
				a { color: #000 };
			`,
			errors: [
				{
					column: 5,
					line: 2,
					rule: 'liferay/no-block-comments',
					severity: 'error',
					text:
						'No block-based comments (/* ... */); use line-based (//) comment syntax instead (liferay/no-block-comments)'
				}
			]
		});
	});

	it('can be turned off', async () => {
		await expect(plugin).toLintStyles({
			code: `
				/* A bad comment. */
				a { color: #000 };
			`,
			errors: [],
			options: false
		});
	});
});
