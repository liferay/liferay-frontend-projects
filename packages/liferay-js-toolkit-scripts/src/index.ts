/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from 'liferay-js-toolkit-core';

const {error, print} = format;

export default function main(): void {
	const scripts = process.argv.slice(2);

	scripts.forEach((script) => {
		try {
			// eslint-disable-next-line liferay/no-dynamic-require, @typescript-eslint/no-var-requires
			const {default: scriptFunction} = require(`./scripts/${script}`);

			if (typeof scriptFunction !== 'function') {
				throw `Script 'js-toolkit ${script}' is invalid`;
			}

			scriptFunction();
		} catch (err) {
			if (err.code === 'MODULE_NOT_FOUND') {
				abort(`Script 'js-toolkit ${script}' does not exist`);
			} else {
				abort(`Script 'js-toolkit ${script}' failed: ${err}`);
			}
		}
	});
}

function abort(msg: string): void {
	print(error`${msg}`);
	process.exit(1);
}
