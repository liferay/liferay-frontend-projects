/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const processJSP = require('../../src/jsp/processJSP');

describe('processJSP()', () => {
	const source = `
				Prologue

				<script>
					// Do stuff!

					(function () {
						var message = 'thing';

						alert(message);
					})();
				</script>

				Epilogue
			`;

	describe('with an onFormat callback', () => {
		it('passes the script contents through the callback', async () => {

			// "Formatter" that upper-cases comments.

			const result = await processJSP(source, {
				onFormat(input) {
					return (
						input.replace(/\/\/.+/, (match) =>
							match.toUpperCase()
						) + '\n'
					);
				},
			});

			expect(result).toBe(`
				Prologue

				<script>
					// DO STUFF!

					(function () {
						var message = 'thing';

						alert(message);
					})();
				</script>

				Epilogue
			`);
		});
	});

	describe('with an onLint callback', () => {
		it('passes the script contents through the callback', async () => {

			// "Linter" that autofixes `var` to `const`.

			const result = await processJSP(source, {
				onLint(input) {
					return input.replace('var', 'const') + '\n';
				},
			});

			expect(result).toBe(`
				Prologue

				<script>
					// Do stuff!

					(function () {
						const message = 'thing';

						alert(message);
					})();
				</script>

				Epilogue
			`);
		});
	});

	describe('with an onMinify callback', () => {
		it('passes the script contents through the callback', async () => {

			// "Minifier" that strips line comments and empty line.

			const result = await processJSP(source, {
				onMinify(input) {
					return input.replace(/^\n/gm, '').replace(/\/\/.+\n/, '');
				},
			});

			// Note that *base indent* gets stripped automatically.

			expect(result).toBe(`
				Prologue

				<script>(function () {
	var message = 'thing';
	alert(message);
})();</script>

				Epilogue
			`);
		});
	});
});
