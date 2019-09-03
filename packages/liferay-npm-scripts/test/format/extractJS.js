/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const extractJS = require('../../src/format/extractJS');

const readFile = util.promisify(fs.readFile);

describe('extractJS()', () => {
	let source;

	beforeEach(async () => {
		const contents = await readFile(
			path.join(__dirname, '../../__fixtures__/format/page.jsp')
		);

		source = contents.toString();
	});

	it('extracts blocks', () => {
		const blocks = extractJS(source);

		expect(blocks).toEqual([
			{
				contents: dedent(4)`
						var testVar = true;
				`,
				match: dedent(4)`<script type="text">
						var testVar = true;
					</script>`,
				scriptAttributes: ' type="text"',
				startLine: 26
			},
			{
				contents: dedent(4)`
						var testVar = true;
				`,
				match: dedent(4)`<aui:script>
						var testVar = true;
					</aui:script>`,
				scriptAttributes: '',
				startLine: 30,
				tagNamespace: 'aui:'
			},
			{
				contents: dedent(4)`
						var Liferay = true

						Liferay.Language.get('foo');

						Liferay.provide(
							window,
							'testFn',
							function() {
								var foo = false;
							}
						);
				`,
				match: dedent(4)`<aui:script use="aui-base,event,node">
						var Liferay = true

						Liferay.Language.get('foo');

						Liferay.provide(
							window,
							'testFn',
							function() {
								var foo = false;
							}
						);
					</aui:script>`,
				scriptAttributes: ' use="aui-base,event,node"',
				startLine: 34,
				tagNamespace: 'aui:'
			},
			{
				contents: dedent(4)`
						<%
						List<String> foo = null;
						%>

						foo();
				`,
				match: dedent(4)`<aui:script>
						<%
						List<String> foo = null;
						%>

						foo();
					</aui:script>`,
				scriptAttributes: '',
				startLine: 48,
				tagNamespace: 'aui:'
			},
			{
				contents: dedent(4)`
						window.foo = 'foo';`,
				match: dedent(4)`<aui:script>
						window.foo = 'foo';</aui:script>`,
				scriptAttributes: '',
				startLine: 80,
				tagNamespace: 'aui:'
			},
			{
				contents: dedent(4)`
						var SOME_OBJ = {
							'\${foo}': 'bar',
							'\${bar}': 'baz'
						};
				`,
				match: dedent(4)`<aui:script>
						var SOME_OBJ = {
							'\${foo}': 'bar',
							'\${bar}': 'baz'
						};
					</aui:script>`,
				scriptAttributes: '',
				startLine: 83,
				tagNamespace: 'aui:'
			},
			{
				contents: dedent(4)`
						alert(fooBarBaz);
						alert(bazFoo_bar);
						alert(FooBar);
				`,
				match: dedent(
					4
				)`<aui:script require="foo/bar/baz, baz/foo_bar, bar/baz/foo as FooBar">
						alert(fooBarBaz);
						alert(bazFoo_bar);
						alert(FooBar);
					</aui:script>`,
				scriptAttributes:
					' require="foo/bar/baz, baz/foo_bar, bar/baz/foo as FooBar"',
				startLine: 90,
				tagNamespace: 'aui:'
			},
			{
				contents: '\n',
				match: '<aui:script require="">\n\t</aui:script>',
				scriptAttributes: ' require=""',
				startLine: 96,
				tagNamespace: 'aui:'
			}
		]);
	});
});

/**
 * Helper function to make these tests (a bit) more readable.
 *
 * Removes `tabs` of indent from each line.
 */
function dedent(tabs) {
	const indent = '\t'.repeat(tabs);
	const regExp = new RegExp(`^${indent}`, 'gm');

	return (strings, ...interpolations) => {
		if (interpolations.length) {
			throw new Error('Unsupported interpolation in template literal');
		}

		return strings[0].replace(regExp, '');
	};
}
