/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');

const plugins = path.join(__dirname, '../plugins');

let status = 0;

fs.readdirSync(plugins).forEach(plugin => {
	const rules = path.join(plugins, plugin, 'tests/lib/rules');

	fs.readdirSync(rules).forEach(rule => {
		const file = path.join(rules, rule);

		try {
			require(file);
		} catch (error) {
			status = 1;

			const location = path.relative('', file);

			// eslint-disable-next-line no-console
			console.log(`In ${location}:\n\n${error}`);
		}
	});
});

process.exit(status);
