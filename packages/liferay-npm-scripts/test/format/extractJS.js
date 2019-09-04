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
				range: {
					end: {
						column: 1,
						line: 4
					},
					start: {
						column: 25,
						line: 2
					}
				},
				scriptAttributes: ' use="other"',
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
				range: {
					end: {
						column: 1,
						line: 4
					},
					start: {
						column: 9,
						line: 2
					}
				},
				scriptAttributes: '',
				tagNamespace: undefined
			}
		]);
	});

	it('extracts one-line "<script>" tags', () => {
		// Testing an edge-case in the `range` arithemetic.
		const blocks = extractJS("<script>alert('Hello');</script>");

		expect(blocks).toEqual([
			{
				contents: "alert('Hello');",
				match: "<script>alert('Hello');</script>",
				range: {
					end: {
						column: 24,
						line: 1
					},
					start: {
						column: 9,
						line: 1
					}
				},
				scriptAttributes: '',
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
				range: {
					end: {
						column: 2,
						line: 28
					},
					start: {
						column: 22,
						line: 26
					}
				},
				scriptAttributes: ' type="text"',
				tagNamespace: undefined
			},
			{
				contents: dedent(4)`
						var testVar = true;
					`,
				match: dedent(4)`<aui:script>
						var testVar = true;
					</aui:script>`,
				range: {
					end: {
						column: 2,
						line: 32
					},
					start: {
						column: 14,
						line: 30
					}
				},
				scriptAttributes: '',
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
				range: {
					end: {
						column: 2,
						line: 46
					},
					start: {
						column: 40,
						line: 34
					}
				},
				scriptAttributes: ' use="aui-base,event,node"',
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
				range: {
					end: {
						column: 2,
						line: 54
					},
					start: {
						column: 14,
						line: 48
					}
				},
				scriptAttributes: '',
				tagNamespace: 'aui:'
			},
			{
				contents: dedent(4)`
						window.foo = 'foo';`,
				match: dedent(4)`<aui:script>
						window.foo = 'foo';</aui:script>`,
				range: {
					end: {
						column: 22,
						line: 81
					},
					start: {
						column: 14,
						line: 80
					}
				},
				scriptAttributes: '',
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
				range: {
					end: {
						column: 2,
						line: 88
					},
					start: {
						column: 14,
						line: 83
					}
				},
				scriptAttributes: '',
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
				range: {
					end: {
						column: 2,
						line: 94
					},
					start: {
						column: 72,
						line: 90
					}
				},
				scriptAttributes:
					' require="foo/bar/baz, baz/foo_bar, bar/baz/foo as FooBar"',
				tagNamespace: 'aui:'
			},
			{
				contents: '\n\t',
				match: '<aui:script require="">\n\t</aui:script>',
				range: {
					end: {
						column: 2,
						line: 97
					},
					start: {
						column: 25,
						line: 96
					}
				},
				scriptAttributes: ' require=""',
				tagNamespace: 'aui:'
			}
		]);
	});
});
