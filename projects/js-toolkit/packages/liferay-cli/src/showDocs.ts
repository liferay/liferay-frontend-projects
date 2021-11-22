/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, format} from '@liferay/js-toolkit-core';

const {info, print, success, text, title} = format;

export default async function showDocs(): Promise<void> {
	print(
		'',
		title`|👋 |Welcome to Liferay JavaScript Toolkit Documentation`,
		'',
		text`
In the future we may add some inline documentation to be browsed right from
here but, until that happens, we invite you to visit our online documentation
following the next link:

	{https://github.com/liferay/liferay-frontend-projects/blob/master/projects/js-toolkit/docs/README.md}

	`
	);
}
