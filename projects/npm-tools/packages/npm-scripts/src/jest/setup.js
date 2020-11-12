/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

global.Headers = require('./mocks/Headers');

global.Liferay = require('./mocks/Liferay');

if (!global.createRange) {
	global.createRange = () => ({
		createContextualFragment(htmlString) {
			const tempDiv = document.createElement('div'); // eslint-disable-line no-undef

			tempDiv.innerHTML = `<br>${htmlString}`;
			tempDiv.removeChild(tempDiv.firstChild);

			const fragment = document.createDocumentFragment(); // eslint-disable-line no-undef

			while (tempDiv.firstChild) {
				fragment.appendChild(tempDiv.firstChild);
			}

			return fragment;
		},
	});
}

global.fetch = require('jest-fetch-mock');

global.themeDisplay = global.Liferay.ThemeDisplay;
