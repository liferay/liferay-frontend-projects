/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const restoreTags = require('../../src/jsp/restoreTags');
const stripIndents = require('../../src/jsp/stripIndents');
const substituteTags = require('../../src/jsp/substituteTags');

describe('restoreTags()', () => {
	it('puts previously extracted tags back in their place (round-trip)', () => {
		const source = `
			text
			#{expr}
			more <%= getStuff() %> here

			<%
			/* comment */
			%>

			<c:if test="<%= someValue() %>">
				children
			</c:if>
		`;

		const [substituted, tags] = substituteTags(source);

		const stripped = stripIndents(substituted);

		// Some fake formatting that moves and changes text.
		const formattedText =
			'\n\t\t\t// Prefix' + stripped.replace('children', 'CHILDREN');

		const result = restoreTags(formattedText, tags);

		const expected = `
			// Prefix
			text
			#{expr}
			more <%= getStuff() %> here

			<%
			/* comment */
			%>

			<c:if test="<%= someValue() %>">
				CHILDREN
			</c:if>
		`;

		expect(result).toEqual(expected);
	});

	it('restores blocks indentation to counteract Prettier', () => {
		// Original `alert()` was indented, but Prettier will dedent it, and we
		// do a preemptive `stripIndents()` to match that.
		const text = stripIndents(`
			/*ʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃ*/
				alert('done');
			/*ʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅ*/
		`);

		const tags = [
			'<my-long-namespace:this-tag>',
			'</my-long-namespace:this-tag>',
		];

		const result = restoreTags(text, tags);

		const expected = `
			<my-long-namespace:this-tag>
				alert('done');
			</my-long-namespace:this-tag>
		`;

		expect(result).toEqual(expected);
	});

	it('adjusts internal indentation when Prettier changes the indent', () => {
		const source = `
			if (condition) {
						<%
						// This is indented too far.
						%>
			}
		`;

		const [substituted, tags] = substituteTags(source);

		// Sanity-check that `substituteTags()` does what we think it does.
		expect(substituted).toBe(`
			if (condition) {
						/*
ƬƬƬƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬƬƬƬ*/
			}
		`);

		// Now imagine Prettier "fixes" the indent like this:
		const formattedText = `
			if (condition) {
				/*
ƬƬƬƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬƬƬƬ*/
			}
		`;

		const result = restoreTags(formattedText, tags);

		const expected = `
			if (condition) {

				<%
				// This is indented too far.
				%>

			}
		`;

		expect(result).toEqual(expected);
	});

	it('correctly handles internal indentation when nested', () => {
		// This is a reduced example of what's in the page_iterator.jsp
		// fixture.
		const source = `
			<c:if test="<%= pages.size() > 1 %>">

				// Regression: this was getting mangled:
				<%
				WikiPage latestWikiPage = (WikiPage)pages.get(1);
				%>

				var compareButton = document.getElementById('<portlet:namespace />compare');
			</c:if>
		`;

		const [substituted, tags] = substituteTags(source);

		// Sanity-check that `substituteTags()` does what we think it does.
		expect(substituted).toBe(`
			//ʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃ

				// Regression: this was getting mangled:
				/*
ƬƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬƬ*/

				var compareButton = document.getElementById('ʾPORTLET_NAMESPACE__ʿcompare');
			/*ʅʅʅ*/
		`);

		// Now imagine Prettier "fixes" the indents like this:
		const formattedText = `
			//ʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃ

			// Regression: this was getting mangled:
			/*
ƬƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬƬ*/

			var compareButton = document.getElementById('ʾPORTLET_NAMESPACE__ʿcompare');
			/*ʅʅʅ*/
		`;

		const result = restoreTags(formattedText, tags);

		const expected = `
			<c:if test="<%= pages.size() > 1 %>">

				// Regression: this was getting mangled:

				<%
				WikiPage latestWikiPage = (WikiPage)pages.get(1);
				%>

				var compareButton = document.getElementById('<portlet:namespace />compare');
			</c:if>
		`;

		expect(result).toEqual(expected);
	});

	it('correctly handles internal indentation inside control structures', () => {
		// This is a reduced example of what's in the source.jsp fixture.
		const source = `
			var sourcePanel = document.querySelector('.source-container');

			<%
			// This one was getting mangled.
			for (AssetRendererFactory<?> curRendererFactory : classTypesAssetRendererFactories) {
				String className = editAssetListDisplayContext.getClassName(curRendererFactory);
			%>

				Util.toggleSelectBox('<portlet:namespace />anyClassType<%= className %>', 'false', '<portlet:namespace /><%= className %>Boxes');

				function <portlet:namespace />toggleSubclasses(removeOrderBySubtype) {

					<%
					// But not this one.
					for (AssetRendererFactory<?> curRendererFactory : classTypesAssetRendererFactories) {
						String className = editAssetListDisplayContext.getClassName(curRendererFactory);
					%>

						<portlet:namespace />toggle<%= className %>(removeOrderBySubtype);

					<%
					}
					%>

				}

			<%
			}
			%>
		`;

		const [substituted, tags] = substituteTags(source);

		// Sanity-check that `substituteTags()` does what we think it does.
		expect(substituted).toBe(`
			var sourcePanel = document.querySelector('.source-container');

			/*
ƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬ*/

				Util.toggleSelectBox('ʾPORTLET_NAMESPACE__ʿanyClassTypeʾJSP_EXPR______ʿ', 'false', 'ʾPORTLET_NAMESPACE__ʿʾJSP_EXPR______ʿBoxes');

				function ʾPORTLET_NAMESPACE__ʿtoggleSubclasses(removeOrderBySubtype) {

					/*
ƬƬƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬƬƬ*/

						ʾPORTLET_NAMESPACE__ʿtoggleʾJSP_EXPR______ʿ(removeOrderBySubtype);

					/*
ƬƬƬƬƬɸ
ƬƬƬƬƬ*/

				}

			/*
ƬƬƬɸ
ƬƬƬ*/
		`);

		// Now imagine Prettier "fixes" the indents like this:
		const formattedText = `
			var sourcePanel = document.querySelector('.source-container');

			/*
ƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬ*/

			Util.toggleSelectBox('ʾPORTLET_NAMESPACE__ʿanyClassTypeʾJSP_EXPR______ʿ', 'false', 'ʾPORTLET_NAMESPACE__ʿʾJSP_EXPR______ʿBoxes');

			function ʾPORTLET_NAMESPACE__ʿtoggleSubclasses(removeOrderBySubtype) {

				/*
ƬƬƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬƬƬƬɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸɸ
ƬƬƬƬƬ*/

				ʾPORTLET_NAMESPACE__ʿtoggleʾJSP_EXPR______ʿ(removeOrderBySubtype);

				/*
ƬƬƬƬƬɸ
ƬƬƬƬƬ*/

			}

			/*
ƬƬƬɸ
ƬƬƬ*/
		`;

		const result = restoreTags(formattedText, tags);

		// Note the line after both `for` keywords is still indented:
		const expected = `
			var sourcePanel = document.querySelector('.source-container');

			<%
			// This one was getting mangled.
			for (AssetRendererFactory<?> curRendererFactory : classTypesAssetRendererFactories) {
				String className = editAssetListDisplayContext.getClassName(curRendererFactory);
			%>

				Util.toggleSelectBox('<portlet:namespace />anyClassType<%= className %>', 'false', '<portlet:namespace /><%= className %>Boxes');

				function <portlet:namespace />toggleSubclasses(removeOrderBySubtype) {

					<%
					// But not this one.
					for (AssetRendererFactory<?> curRendererFactory : classTypesAssetRendererFactories) {
						String className = editAssetListDisplayContext.getClassName(curRendererFactory);
					%>

						<portlet:namespace />toggle<%= className %>(removeOrderBySubtype);

					<%
					}
					%>

				}

			<%
			}
			%>

		`;

		expect(result).toEqual(expected);
	});

	it('throws when passed the wrong number of tags', () => {
		expect(() => {
			restoreTags('some text', ['<%= "a tag" %>']);
		}).toThrow('Expected replacement count 0, but got 1');
	});
});
