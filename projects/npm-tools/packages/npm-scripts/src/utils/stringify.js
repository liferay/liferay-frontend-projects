/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Stringifies config as JSON in a manner pleasing to the Java SourceFormatter.
 */
function stringify(config, level = 0) {
	const indent = '\t'.repeat(level);

	if (config === undefined) {
		return;
	}
	else if (Array.isArray(config)) {
		const items = config.map((item) => {
			if (item === undefined) {
				return `${indent}\tnull`;
			}
			else {
				return `${indent}\t` + stringify(item, level + 1).trimStart();
			}
		});

		return (
			`${indent}[\n` +
			(items.length ? items.join(',\n') + '\n' : '') +
			`${indent}]`
		);
	}
	else if (config && typeof config === 'object') {
		const entries = Object.entries(config)
			.map(([key, value]) => {
				if (value === undefined) {
					return;
				}
				else {
					return (
						`${indent}\t${JSON.stringify(key)}: ` +
						stringify(value, level + 1).trimStart()
					);
				}
			})
			.filter(Boolean);

		return (
			`${indent}{\n` +
			(entries.length ? entries.join(',\n') + '\n' : '') +
			`${indent}}`
		);
	}
	else {
		return `${indent}${JSON.stringify(config)}`;
	}
}

module.exports = stringify;
