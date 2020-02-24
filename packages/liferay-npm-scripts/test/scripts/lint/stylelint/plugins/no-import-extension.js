/**
 * © 2020 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

describe('liferay/no-import-extension', () => {
	const plugin = 'liferay/no-import-extension';

	it('accepts imports without ".scss" extensions', async () => {
		await expect(plugin).toLintStyles({
			code: `
				@import "example";
				@import 'stuff';
				@import 'thing.css';
			`,
			errors: []
		});
	});

	it('does not touch `url()` imports', async () => {
		await expect(plugin).toLintStyles({
			code: `
				@import url('foo');
				@import url("bar");
				@import url("baz.css");

				// Note how SCSS allows us to skip quotes around URLs.
				@import url(bar);

				// Rule ignores even this (bogus) url.
				@import url('weird.scss');
			`,
			errors: []
		});
	});

	it('autofixes', async () => {
		await expect(plugin).toLintStyles({
			code: `
				@import 'a.scss';
				@import "b.scss";
			`,
			errors: [],
			output: `
				@import 'a';
				@import "b";
			`
		});
	});

	it('can be turned off', async () => {
		await expect(plugin).toLintStyles({
			code: `
				@import 'a.scss';
				@import "b.scss";
			`,
			errors: [],
			options: false
		});
	});
});
