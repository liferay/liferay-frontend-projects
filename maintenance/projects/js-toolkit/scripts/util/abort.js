/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

module.exports = function abort(...msgs) {
	console.error(`\n❌ ${msgs.join('\n')}\n`);

	process.exit(1);
};
