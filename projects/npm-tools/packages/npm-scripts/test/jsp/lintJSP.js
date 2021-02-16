/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const dedent = require('../../support/dedent');
const getFixturePath = require('../../support/getFixturePath');

describe('lintJSP()', () => {
	let cwd;
	let onReport;

	function lintJSP() {
		const lint = require('../../src/jsp/lintJSP');

		return lint(...arguments);
	}

	beforeEach(() => {
		cwd = process.cwd();

		onReport = jest.fn();

		jest.resetModules();
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	function getFixture(id) {
		return getFixturePath(
			path.join('utils', 'getDXPVersion', id, 'modules')
		);
	}

	it('passes valid code straight through', async () => {
		const source = dedent(3)`
			<script>
				Liferay.fire('someEvent');
			</script>
		`;

		const result = await lintJSP(source, onReport);

		expect(result).toBe(source);

		expect(onReport).not.toBeCalled();
	});

	it('reports simple problems (eg. no-extra-boolean-cast rule)', async () => {
		const source = dedent(3)`
			<script>
				var bool = !!!other;
			</script>
		`;

		const result = await lintJSP(source, onReport);

		// Note: did not autofix because we didn't pass `{fix: true}`.

		expect(result).toBe(dedent(3)`
			<script>
				var bool = !!!other;
			</script>
		`);

		expect(onReport).toBeCalledWith({
			errorCount: 1,
			fixableErrorCount: 1,
			fixableWarningCount: 0,
			messages: [
				expect.objectContaining({
					column: 13,
					fix: expect.any(Object),
					line: 3,
					message: 'Redundant double negation.',
					ruleId: 'no-extra-boolean-cast',
					severity: 2,
				}),
			],
			source: expect.stringContaining('var bool = !!!other;'),
			warningCount: 0,
		});
	});

	it('reports debugger statements (eg. no-debugger rule)', async () => {
		const source = dedent(3)`
			<script>
				debugger;
			</script>
		`;

		const result = await lintJSP(source, onReport);

		// No autofix.

		expect(result).toBe(dedent(3)`
			<script>
				debugger;
			</script>
		`);

		expect(onReport).toBeCalledWith({
			errorCount: 1,
			fixableErrorCount: 0,
			fixableWarningCount: 0,
			messages: [
				expect.objectContaining({
					column: 1,
					line: 3,
					message: "Unexpected 'debugger' statement.",
					ruleId: 'no-debugger',
					severity: 2,
				}),
			],
			source: expect.stringContaining('debugger;'),
			warningCount: 0,
		});
	});

	it('deals with a mixture of fixable and not-fixable errors', async () => {

		// eg: 1 autofix and 1 not-autofix

		const source = dedent(3)`
			<script>
				var bool = !!!other;
				debugger;
			</script>
		`;

		const result = await lintJSP(source, onReport);

		// No autofix.

		expect(result).toBe(dedent(3)`
			<script>
				var bool = !!!other;
				debugger;
			</script>
		`);

		expect(onReport).toBeCalledWith({
			errorCount: 2,
			fixableErrorCount: 1,
			fixableWarningCount: 0,
			messages: [
				expect.objectContaining({
					column: 13,
					fix: expect.any(Object),
					line: 3,
					message: 'Redundant double negation.',
					ruleId: 'no-extra-boolean-cast',
					severity: 2,
				}),
				expect.objectContaining({
					column: 1,
					line: 4,
					message: "Unexpected 'debugger' statement.",
					ruleId: 'no-debugger',
					severity: 2,
				}),
			],
			source: expect.stringContaining('debugger;'),
			warningCount: 0,
		});
	});

	describe('on 7.3', () => {
		beforeEach(() => {
			const modules = getFixture('7.3');

			process.chdir(modules);
		});

		it('rejects const declarations as syntax errors', async () => {
			const source = dedent(3)`
				<script>
					const x = 1;
				</script>
			`;

			const result = await lintJSP(source, onReport);

			// No autofix.

			expect(result).toBe(dedent(3)`
				<script>
					const x = 1;
				</script>
			`);

			expect(onReport).toBeCalledWith({
				errorCount: 1,
				fixableErrorCount: 0,
				fixableWarningCount: 0,
				messages: [
					expect.objectContaining({
						column: 1,
						fatal: true,
						line: 3,
						message:
							"Parsing error: The keyword 'const' is reserved",
						ruleId: null,
						severity: 2,
					}),
				],
				source: expect.stringContaining('const x = 1;'),
				warningCount: 0,
			});
		});

		it('rejects arrow functions as syntax errors', async () => {
			const source = dedent(3)`
				<script>
					var x = () => 1;
				</script>
			`;

			const result = await lintJSP(source, onReport);

			// No autofix.

			expect(result).toBe(dedent(3)`
				<script>
					var x = () => 1;
				</script>
			`);

			expect(onReport).toBeCalledWith({
				errorCount: 1,
				fixableErrorCount: 0,
				fixableWarningCount: 0,
				messages: [
					expect.objectContaining({
						column: 10,
						fatal: true,
						line: 3,
						message: 'Parsing error: Unexpected token )',
						ruleId: null,
						severity: 2,
					}),
				],
				source: expect.stringContaining('var x = () => 1;'),
				warningCount: 0,
			});
		});
	});

	describe('on 7.4', () => {
		beforeEach(() => {
			const modules = getFixture('7.4');

			process.chdir(modules);
		});

		it('permits const declarations', async () => {
			const source = dedent(3)`
				<script>
					const x = 1;
				</script>
			`;

			const result = await lintJSP(source, onReport);

			expect(result).toBe(source);

			expect(onReport).not.toBeCalled();
		});

		it('permits arrow functions', async () => {
			const source = dedent(3)`
				<script>
					var x = () => 1;
				</script>
			`;

			const result = await lintJSP(source, onReport);

			expect(result).toBe(source);

			expect(onReport).not.toBeCalled();
		});

		it('prefers arrow functions', async () => {
			const source = dedent(3)`
				<script>
					Liferay.on('foo', function (data) {
						alert('We got the data!');
					});
				</script>
			`;

			let result = await lintJSP(source, onReport);

			// No autofix.

			expect(result).toBe(dedent(3)`
				<script>
					Liferay.on('foo', function (data) {
						alert('We got the data!');
					});
				</script>
			`);

			expect(onReport).toBeCalledWith({
				errorCount: 1,
				fixableErrorCount: 1,
				fixableWarningCount: 0,
				messages: [
					expect.objectContaining({
						line: 3,
						message: 'Unexpected function expression.',
						messageId: 'preferArrowCallback',
						nodeType: 'FunctionExpression',
						ruleId: 'prefer-arrow-callback',
						severity: 2,
					}),
				],
				source: expect.stringContaining('function (data)'),
				warningCount: 0,
			});

			// With autofix.

			result = await lintJSP(source, onReport, {fix: true});

			expect(result).toBe(dedent(3)`
				<script>
					Liferay.on('foo', (data) => {
						alert('We got the data!');
					});
				</script>
			`);

			expect(onReport).toBeCalledWith({
				errorCount: 1,
				fixableErrorCount: 1,
				fixableWarningCount: 0,
				messages: [
					expect.objectContaining({
						line: 3,
						message: 'Unexpected function expression.',
						messageId: 'preferArrowCallback',
						nodeType: 'FunctionExpression',
						ruleId: 'prefer-arrow-callback',
						severity: 2,
					}),
				],
				source: expect.stringContaining('void'),
				warningCount: 0,
			});
		});
	});

	describe('`fix` option', () => {
		it('passes valid code straight through', async () => {
			const source = dedent(3)`
				<script>
					Liferay.fire('someEvent');
				</script>
			`;

			const result = await lintJSP(source, onReport, {fix: true});

			expect(result).toBe(source);

			expect(onReport).not.toBeCalled();
		});

		it('fixes simple problems (eg. no-extra-boolean-cast rule)', async () => {
			const source = dedent(3)`
				<script>
					var bool = !!!other;
				</script>
			`;

			const result = await lintJSP(source, onReport, {fix: true});

			expect(result).toBe(dedent(3)`
				<script>
					var bool = !other;
				</script>
			`);

			// Note: no report because there are no unfixed problems left.

			expect(onReport).not.toBeCalled();
		});

		it('does not fix when `fix` is `false`', async () => {
			const source = dedent(3)`
				<script>
					var bool = !!!other;
				</script>
			`;

			const result = await lintJSP(source, onReport, {fix: false});

			expect(result).toBe(source);

			expect(onReport).toBeCalledWith({
				errorCount: 1,
				fixableErrorCount: 1,
				fixableWarningCount: 0,
				messages: [
					expect.objectContaining({
						column: 13,
						fix: expect.any(Object),
						line: 3,
						message: 'Redundant double negation.',
						ruleId: 'no-extra-boolean-cast',
						severity: 2,
					}),
				],
				source: expect.stringContaining('var bool = !!!other;'),
				warningCount: 0,
			});
		});

		it('does not fix when `fix` is not explicitly passed', async () => {
			const source = dedent(3)`
				<script>
					var bool = !!!other;
				</script>
			`;

			const result = await lintJSP(source, onReport);

			expect(result).toBe(source);

			expect(onReport).toBeCalledWith({
				errorCount: 1,
				fixableErrorCount: 1,
				fixableWarningCount: 0,
				messages: [
					expect.objectContaining({
						column: 13,
						fix: expect.any(Object),
						line: 3,
						message: 'Redundant double negation.',
						ruleId: 'no-extra-boolean-cast',
						severity: 2,
					}),
				],
				source: expect.stringContaining('var bool = !!!other;'),
				warningCount: 0,
			});
		});

		it('deals with a mixture of fixable and not-fixable errors', async () => {

			// eg: 1 autofix and 1 not-autofix

			const source = dedent(3)`
				<script>
					var bool = !!!other;
					debugger;
				</script>
			`;

			const result = await lintJSP(source, onReport, {fix: true});

			expect(result).toBe(dedent(3)`
				<script>
					var bool = !other;
					debugger;
				</script>
			`);

			expect(onReport).toBeCalledWith({
				errorCount: 1,
				fixableErrorCount: 0,
				fixableWarningCount: 0,
				messages: [
					expect.objectContaining({
						column: 1,
						line: 4,
						message: "Unexpected 'debugger' statement.",
						ruleId: 'no-debugger',
						severity: 2,
					}),
				],
				source: expect.stringContaining('debugger;'),
				warningCount: 0,
			});
		});
	});

	describe('`quiet` option', () => {

		// Nothing much to meaningfully test here because we almost don't use
		// "warn"  at all in liferay-portal; so we just show that it basically
		// works the same as above.

		it('works', async () => {

			// eg: 1 autofix and 1 not-autofix

			const source = dedent(3)`
				<script>
					var bool = !!!other;
					debugger;
				</script>
			`;

			const result = await lintJSP(source, onReport, {
				fix: true,
				quiet: true,
			});

			expect(result).toBe(dedent(3)`
				<script>
					var bool = !other;
					debugger;
				</script>
			`);

			expect(onReport).toBeCalledWith({
				errorCount: 1,
				fixableErrorCount: 0,
				fixableWarningCount: 0,
				messages: [
					expect.objectContaining({
						column: 1,
						line: 4,
						message: "Unexpected 'debugger' statement.",
						ruleId: 'no-debugger',
						severity: 2,
					}),
				],
				source: expect.stringContaining('debugger;'),
				warningCount: 0,
			});
		});
	});
});
