/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const PASSWORD = process.env.PASSWORD;
const PORT = process.env.PORT || 5000;
const PROJECT = process.env.PROJECT || 'IFI';
const SECRET = process.env.SECRET;
const USERNAME = process.env.USERNAME;

module.exports = {
	PASSWORD,
	PORT,
	PROJECT,
	SECRET,
	USERNAME,
};
