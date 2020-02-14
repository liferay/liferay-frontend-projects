/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

global.Headers = require('./mocks/Headers');

global.Liferay = require('./mocks/Liferay');

global.fetch = require('jest-fetch-mock');

global.themeDisplay = global.Liferay.ThemeDisplay;
