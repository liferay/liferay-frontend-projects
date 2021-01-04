/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict';

import globals from '../globals/globals';
import AppDataAttributeHandler from './AppDataAttributeHandler';

/**
 * Data attribute handler.
 * @type {AppDataAttributeHandler}
 */
var dataAttributeHandler = new AppDataAttributeHandler();

globals.document.addEventListener('DOMContentLoaded', () => {
	dataAttributeHandler.setBaseElement(globals.document.body);
	dataAttributeHandler.handle();
});

export default dataAttributeHandler;
