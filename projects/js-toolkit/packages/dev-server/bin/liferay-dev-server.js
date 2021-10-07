#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

import server from '../lib/server';

async function main() {
	await server();
}

main().catch((error) => {
	console.log(error); // eslint-disable-line no-console

	process.exit(1);
});
