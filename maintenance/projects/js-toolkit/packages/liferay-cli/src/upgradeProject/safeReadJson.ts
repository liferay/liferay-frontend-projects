/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath} from '@liferay/js-toolkit-core';
import fs from 'fs';

export default function safeReadJson(posixFilePath: string): object {
	try {
		return JSON.parse(
			fs.readFileSync(
				new FilePath(posixFilePath, {posix: true}).toString(),
				'utf8'
			)
		);
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}

	return {};
}
