/**
 * © 2020 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

describe('liferay/sort-imports', () => {
	const plugin = 'liferay/sort-imports';

	it('accepts well-ordered imports', async () => {
		await expect(plugin).toLintStyles({
			code: `
				@import 'stuff';
				@import 'thing';

				a { color: #000; }
			`,
			errors: []
		});
	});

	it('interprets blank lines as group separators', async () => {
		// We don't care about order between groups, only within groups.
		await expect(plugin).toLintStyles({
			code: `
				@import 'stuff';
				@import 'thing';

				@import 'other';
				@import 'things';

				a { color: #000; }
			`,
			errors: []
		});
	});

	it('interprets non-imports as group separators', async () => {
		await expect(plugin).toLintStyles({
			code: `
				@import 'zzz';
				a { color: #000; }
				@import 'aaa';
			`,
			errors: []
		});
	});

	it('autofixes a single group', async () => {
		await expect(plugin).toLintStyles({
			code: `
				@import 'b';
				@import 'c';
				@import 'a';

				a { color: #000 };
			`,
			errors: [],
			output: `
				@import 'a';
				@import 'b';
				@import 'c';

				a { color: #000 };
			`
		});
	});

	it('autofixes multiple groups', async () => {
		await expect(plugin).toLintStyles({
			code: `
				@import 'xyz';
				@import 'abc';
				@import 'hjk';

				@import 'b';
				@import 'c';
				@import 'a';

				a { color: #000 };
			`,
			errors: [],
			output: `
				@import 'abc';
				@import 'hjk';
				@import 'xyz';

				@import 'a';
				@import 'b';
				@import 'c';

				a { color: #000 };
			`
		});
	});

	it('can be turned off', async () => {
		await expect(plugin).toLintStyles({
			code: `
				@import 'b';
				@import 'a';

				a { color: #000 };
			`,
			errors: [],
			options: false
		});
	});
});
