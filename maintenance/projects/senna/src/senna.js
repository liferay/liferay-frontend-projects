/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict';

import App from './app/App';
import dataAttributeHandler from './app/dataAttributeHandler';
import version from './app/version';
import Route from './route/Route';
import HtmlScreen from './screen/HtmlScreen';
import RequestScreen from './screen/RequestScreen';
import Screen from './screen/Screen';
import utils from './utils/utils';

export default App;
export {
	dataAttributeHandler,
	utils,
	App,
	HtmlScreen,
	Route,
	RequestScreen,
	Screen,
	version,
};
