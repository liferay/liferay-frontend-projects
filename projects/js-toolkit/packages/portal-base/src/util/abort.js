/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {format} = require('@liferay/js-toolkit-core');

const {fail, print} = format;

module.exports = function abort(error) {
	if (error.stack) {
		print(error.stack);
	}
	else {
		print(error.toString());
	}

	print(fail`Build failed`);
	process.exit(1);
};
