#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {default: server} = require('../lib/server');

async function main() {
	await server();
}

main().catch((error) => {
	console.log(error); // eslint-disable-line no-console

	process.exit(1);
});
