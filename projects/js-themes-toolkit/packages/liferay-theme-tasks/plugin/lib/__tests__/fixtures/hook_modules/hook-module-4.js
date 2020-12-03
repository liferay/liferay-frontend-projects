/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

var sinon = require('sinon');

var spy = sinon.spy();

module.exports = function() {
	spy.apply(this, arguments);

	return spy;
};
