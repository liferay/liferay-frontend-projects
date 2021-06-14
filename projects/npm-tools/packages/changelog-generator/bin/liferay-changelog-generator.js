#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {main} = require('../src');

main(...process.argv).catch((error) => {
	process.stderr.write(`${error}\n`);
	process.exit(1);
});
