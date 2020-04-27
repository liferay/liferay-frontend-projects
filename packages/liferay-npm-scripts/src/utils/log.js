/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

function log(...messages) {
	// eslint-disable-next-line no-console
	messages.forEach((message) => console.log(message));
}

module.exports = log;
