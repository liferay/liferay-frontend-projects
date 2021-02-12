/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getTaglibInvocations = require('../../src/jsp/getTaglibInvocations');

describe('getTaglibInvocations()', () => {
	it('works for regular invocations', () => {
		const jsp = `
<%-- Copyright Liferay %-->

<%@ include file="/init.jsp" %>

<div id="<portlet:namespace />-app-builder-root">
	<aui:script require="my-module as x">
		console.log(x);
	</aui:script>

	Hello world!

	<aui:script require="your-module as y" position="inline">
		console.log(y);
	</aui:script>
</div>`;

		const invocations = getTaglibInvocations(jsp, 'aui:script');

		expect(invocations).toHaveLength(2);

		expect(invocations[0]).toMatchObject({
			attributes: {
				require: 'my-module as x',
			},
			tag: 'aui:script',
		});

		expect(invocations[1]).toMatchObject({
			attributes: {
				position: 'inline',
				require: 'your-module as y',
			},
			tag: 'aui:script',
		});
	});

	it('works for invocations with runtime attributes', () => {
		const jsp = `
<aui:script require="<%= npmResolvedPackageName %>/my-module">
	console.log(x);
</aui:script>`;

		const invocations = getTaglibInvocations(jsp, 'aui:script');

		expect(invocations).toHaveLength(1);

		expect(invocations[0]).toMatchObject({
			attributes: {
				require: '<%= npmResolvedPackageName %>/my-module',
			},
			tag: 'aui:script',
		});
	});

	it('works for invocations with no attributes', () => {
		const jsp = `<aui:script>console.log(x);</aui:script>`;

		const invocations = getTaglibInvocations(jsp, 'aui:script');

		expect(invocations).toHaveLength(1);

		expect(invocations[0]).toMatchObject({
			attributes: {},
			tag: 'aui:script',
		});
	});
});
