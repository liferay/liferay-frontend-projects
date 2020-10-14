/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as log from './log';

/**
 * Abort build and exit with return code 1
 *
 * @param message optional message to show before aborting
 */
export default function abort(message?: string): void {
	if (message) {
		log.error(message);
	}

	process.exit(1);
}
