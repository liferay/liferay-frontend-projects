/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* global ga */

// https://developers.google.com/analytics/devguides/collection/analyticsjs/single-page-applications

document.addEventListener('DOMContentLoaded', () => {
	var app = senna.dataAttributeHandler.getApp();

	app.on('endNavigate', (event) => {
		ga('set', 'page', event.path);
		ga('send', 'pageview');
	});
});
