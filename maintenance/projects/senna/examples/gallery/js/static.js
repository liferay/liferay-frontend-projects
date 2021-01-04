/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

document.addEventListener('DOMContentLoaded', () => {
	var app = new senna.App();
	app.setBasePath('/examples/gallery');
	app.addSurfaces('preview');
	app.addRoutes(new senna.Route(/\w+\.html/, senna.HtmlScreen));
});
