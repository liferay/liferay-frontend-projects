/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-env jest */

const AUI = () => ({
	use: (key, callback) => callback(key),
});

module.exports = {
	...AUI,
};
