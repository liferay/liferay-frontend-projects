/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const formatJSP = require('../../src/jsp/formatJSP');
const getFixture = require('../../support/getFixture');

describe('formatJSP()', () => {
	it('deals with interleaved JS control structures and JSP tags', () => {
		// eg. an `if()` that is conditionally added augmented with an `else()`
		// based on a tag.
		const source = `
			<p>Hi!</p>
			<script>
				if (richEditor.getEditor().getSession().getUndoManager().hasUndo()) {
					Liferay.fire('<portlet:namespace />saveTemplate');
				}
				<c:if test="<%= template == null %>">
					else {
						editorContentElement.val(STR_EMPTY);
					}
				</c:if>
			</script>
		`;

		// Note that Prettier keeps the `else` in the right place
		// due to special casing explained in the notes in the
		// `tagReplacements()` implementation.
		expect(formatJSP(source)).toBe(`
			<p>Hi!</p>
			<script>
				if (
					richEditor
						.getEditor()
						.getSession()
						.getUndoManager()
						.hasUndo()
				) {
					Liferay.fire('<portlet:namespace />saveTemplate');
				}
				<c:if test="<%= template == null %>">
					else {
						editorContentElement.val(STR_EMPTY);
					}
				</c:if>
			</script>
		`);
	});

	it('pads input so that Prettier syntax errors have accurate line numbers', () => {
		const source = `
			<p>Hi!</p>

			<p>Some content.</p>

			<p>Some more content.</p>

			<p>Even more content.</p>

			<script>
				if (success()) {
					Liferay.fire('success');
				} else
					alert('Error!');

					// Without padding, Prettier would report an error on the
					// following line as having happened at (8:1).
				}
			</script>
		`;

		expect(() => formatJSP(source)).toThrow(/Unexpected token \(18:1\)/);
	});

	it('trims unwanted leading blank lines', () => {
		const source = `
			<aui:script require="metal-dom/src/dom">

				var dom = metalDomSrcDom.default;
			</aui:script>
		`;

		const expected = `
			<aui:script require="metal-dom/src/dom">
				var dom = metalDomSrcDom.default;
			</aui:script>
		`;

		expect(formatJSP(source)).toBe(expected);
	});

	it('correctly handles internal indentation inside control structures', () => {
		// This is a reduced example of what's in the source.jsp fixture.
		const source = `
			<aui:script require="metal-dom/src/dom as dom">
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

			</aui:script>
		`;

		expect(formatJSP(source)).toBe(`
			<aui:script require="metal-dom/src/dom as dom">
				var sourcePanel = document.querySelector('.source-container');

				<%
				// This one was getting mangled.
				for (AssetRendererFactory<?> curRendererFactory : classTypesAssetRendererFactories) {
					String className = editAssetListDisplayContext.getClassName(curRendererFactory);
				%>

					Util.toggleSelectBox(
						'<portlet:namespace />anyClassType<%= className %>',
						'false',
						'<portlet:namespace /><%= className %>Boxes'
					);

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

			</aui:script>
		`);
	});

	it('respects indentation within a nested control structures', () => {
		// This is a reduced example of what's in the source.jsp fixture.
		const source = `
			<aui:script>

				<%
				for (A<?> a : b) {
				%>

					Util.toggleSelectBox();

					<%
					for (C c : d) {
					%>

						var optgroupClose = '</optgroup>';

					<%
					}
					%>

					columnBuffer1.push(optgroupClose);

				<%
				}
				%>

			</aui:script>
		`;

		const expected = `
			<aui:script>

				<%
				for (A<?> a : b) {
				%>

					Util.toggleSelectBox();

					<%
					for (C c : d) {
					%>

						var optgroupClose = '</optgroup>';

					<%
					}
					%>

					columnBuffer1.push(optgroupClose);

				<%
				}
				%>

			</aui:script>
		`;

		expect(formatJSP(source)).toBe(expected);
	});

	it('returns the source unmodified if there are no JSP tags', () => {
		const source = `
			<%--
			/**
			 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
			 */
			--%>

			<%
			String heading = "Amazing Page";
			%>

			<h1><%= heading %></h1>
		`;

		expect(formatJSP(source)).toBe(source);
	});

	it('handles an edge case (#258)', () => {
		// Reduced example of what's in
		// modules/apps/asset/asset-publisher-web/src/main/resources/META-INF/resources/configuration/source.jsp
		const source = `
			<aui:script>

				<%
				for (AssetRendererFactory<?> curRendererFactory : classTypesAssetRendererFactories) {
					String className = assetPublisherWebUtil.getClassName(curRendererFactory);
				%>

					Util.toggleSelectBox();

				<%
				}
				%>

				function <portlet:namespace />toggleSubclasses(removeOrderBySubtype) {

					<%
					for (AssetRendererFactory<?> curRendererFactory : classTypesAssetRendererFactories) {
						String className = assetPublisherWebUtil.getClassName(curRendererFactory);
					%>

						<portlet:namespace />toggle<%= className %>(removeOrderBySubtype);

					<%
					}
					%>

				}
			</aui:script>
		`;

		expect(formatJSP(source)).toBe(`
			<aui:script>

				<%
				for (AssetRendererFactory<?> curRendererFactory : classTypesAssetRendererFactories) {
					String className = assetPublisherWebUtil.getClassName(curRendererFactory);
				%>

					Util.toggleSelectBox();

				<%
				}
				%>

				function <portlet:namespace />toggleSubclasses(removeOrderBySubtype) {

					<%
					for (AssetRendererFactory<?> curRendererFactory : classTypesAssetRendererFactories) {
						String className = assetPublisherWebUtil.getClassName(curRendererFactory);
					%>

						<portlet:namespace />toggle<%= className %>(removeOrderBySubtype);

					<%
					}
					%>

				}
			</aui:script>
		`);
	});

	describe('formatting entire fixtures', () => {
		test.each([
			'configuration.jsp',
			'details.jsp',
			'edit_public_render_parameters.jsp',
			'edit_template_display.jspf',
			'page.jsp',
			'page_iterator.jsp',
			'recaptcha.jsp',
			'roles.jsp',
			'source.jsp',
			'view.jsp',
			'view_calendar_menus.jspf',
			'view_meeting.jsp'

			// Not including these (rejected by Prettier, see "known
			// limitations" below):
			// 'edit_content_redirect.jsp',
		])('%s matches snapshot', async fixture => {
			const source = await getFixture(path.join('jsp', fixture));

			expect(formatJSP(source)).toMatchSnapshot();
		});
	});

	describe('known limitations', () => {
		it('cannot deal with conditionals at the end of object literals', () => {
			// This one from "edit_content_redirect.jsp": note that without
			// trailing commas after the "redirect" and "refresh" properties,
			// Prettier will report a syntax error. We can't add commas to
			// either because that would break IE 11.
			const source = `
				<aui:script>
					Liferay.fire(
						'closeWindow',
						{
							id: '<portlet:namespace />editAsset',
							portletAjaxable: true,

							<c:choose>
								<c:when test="<%= redirect != null %>">
									redirect: '<%= HtmlUtil.escapeJS(redirect) %>'
								</c:when>
								<c:otherwise>
									refresh: '<%= portletDisplay.getId() %>'
								</c:otherwise>
							</c:choose>
						}
					);
				</aui:script>
			`;

			expect(() => formatJSP(source)).toThrow(
				/Unexpected token, expected ","/
			);
		});
	});
});
