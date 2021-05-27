/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from '@liferay/js-toolkit-core';

import newProject from './new';

interface Arguments {
	_: string[];
	$0: string;
	batch?: boolean;
	name?: string;
}

const {error, print} = format;

/** Default entry point for the @liferay/cli executable. */
export default async function (argv: Arguments): Promise<void> {
	switch (argv._[0]) {
		case 'new':
			return await newProject(argv.name, argv.batch);

		default:
			print(error`Uknown command provided: {${argv._[0]}}`);
			process.exit(1);
	}
}
