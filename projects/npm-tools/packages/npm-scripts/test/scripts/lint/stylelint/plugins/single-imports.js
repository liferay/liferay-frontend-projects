/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

describe('liferay/single-imports', () => {
	const plugin = 'liferay/single-imports';

	it('accepts single imports', async () => {
		await expect(plugin).toLintStyles({
			code: `
				@import 'stuff';
				@import "thing";
				@import url(example.css);
				@import url('other.css');
				@import url("that.css");
			`,
			errors: [],
		});
	});

	it('autofixes an import with multiple resources', async () => {
		await expect(plugin).toLintStyles({
			code: `
				@import 'a', "b", url(c.css), url('d.css'), url("e.css");
				@import 'f', 'g';

				@import 'first',
					'second',
					url('third.css');

				a { color: #000 };
			`,
			errors: [],
			output: `
				@import 'a';
				@import "b";
				@import url(c.css);
				@import url('d.css');
				@import url("e.css");
				@import 'f';
				@import 'g';

				@import 'first';
				@import 'second';
				@import url('third.css');

				a { color: #000 };
			`,
		});
	});

	it('autofixes imports in column 0', async () => {
		// Seeing as indented code like that in the test above isn't going to be
		// typical in our codebase.

		await expect(plugin).toLintStyles({
			code:
				`@import 'a', "b", url(c.css), url('d.css'), url("e.css");\n` +
				"@import 'f', 'g';\n" +
				'\n' +
				"@import 'first',\n" +
				"\t'second',\n" +
				"\turl('third.css');\n" +
				'\n' +
				'a { color: #000 };\n',
			errors: [],
			output:
				"@import 'a';\n" +
				'@import "b";\n' +
				'@import url(c.css);\n' +
				"@import url('d.css');\n" +
				'@import url("e.css");\n' +
				"@import 'f';\n" +
				"@import 'g';\n" +
				'\n' +
				"@import 'first';\n" +
				"@import 'second';\n" +
				"@import url('third.css');\n" +
				'\n' +
				'a { color: #000 };\n',
		});
	});

	it('can be turned off', async () => {
		await expect(plugin).toLintStyles({
			code: `
				@import 'a', 'b';

				a { color: #000 };
			`,
			errors: [],
			options: false,
		});
	});
});
