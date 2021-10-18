/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from '@liferay/js-toolkit-core';

const {fail, print} = format;

export default function abort(error: Error | string): void {
	if (error['stack']) {
		print(error['stack']);
	}
	else {
		print(error.toString());
	}

	print(fail`Build failed`);
	process.exit(1);
}
