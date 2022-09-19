/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from '@liferay/js-toolkit-core';
import {success} from '@liferay/js-toolkit-core/lib/format';

const {print, text, title} = format;

interface Callback {
	(): Promise<void>;
}

export default async function runConfigureWizard(
	command: string,
	callback: Callback
): Promise<void> {
	const name = command.charAt(0).toUpperCase() + command.substr(1);

	print('', title`|👋 |Welcome to the ${name} configuration wizard`, '');
	print(
		text`
The wizard will ask you some questions to configure how the ${command} command
behaves.

You may accept the default values for any setting you don't want to modify.`,
		''
	);

	await callback();

	print('', success`Your new configuration has been saved`);
}
