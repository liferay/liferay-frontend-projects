/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const extractJS = require('../../src/format/extractJS');
const dedent = require('../../support/dedent');
const getFixture = require('../../support/getFixture');

describe('extractJS()', () => {
	it('extracts "<aui:script>" tags', () => {
		const blocks = extractJS(dedent(3)`
			<aui:script use="other">
				alert(A.other.thing);
			</aui:script>
		`);

		expect(blocks).toEqual([
			{
				contents: dedent(4)`
					alert(A.other.thing);
				`,
				match: dedent(4)`<aui:script use="other">
					alert(A.other.thing);
				</aui:script>`,
				scriptAttributes: ' use="other"',
				startLine: 2,
				tagNamespace: 'aui:'
			}
		]);
	});

	it('extracts bare "<script>" tags', () => {
		const blocks = extractJS(dedent(3)`
			<script>
				alert('Hello');
			</script>
		`);

		expect(blocks).toEqual([
			{
				contents: dedent(4)`
					alert('Hello');
				`,
				match: dedent(4)`<script>
					alert('Hello');
				</script>`,
				scriptAttributes: '',
				startLine: 2,
				tagNamespace: undefined
			}
		]);
	});

	it('extracts blocks from test fixture', async () => {
		// This is the test fixture from the check-source-formatting package.
		const source = await getFixture('format/page.jsp');

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
				startLine: 26,
				tagNamespace: undefined
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
				contents: '\n\t',
				match: '<aui:script require="">\n\t</aui:script>',
				scriptAttributes: ' require=""',
				startLine: 96,
				tagNamespace: 'aui:'
			}
		]);
	});
});
