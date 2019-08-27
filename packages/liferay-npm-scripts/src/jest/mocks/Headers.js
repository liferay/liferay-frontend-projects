/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

module.exports = class Headers {
	constructor(init) {
		if (init instanceof Headers) {
			return init;
		}

		const headerList = {};

		let entries = [];

		if (Array.isArray(init)) {
			entries = init;
		} else if (init && typeof init === 'object') {
			entries = Object.entries(init);
		}

		entries.forEach(([key, value]) => {
			key = key.toLowerCase();

			const headerValues = headerList[key] || [];

			headerValues.push(value);

			headerList[key] = headerValues;
		});

		this.headerList = headerList;
	}

	forEach(callback) {
		const entries = Object.entries(this.headerList);

		entries.forEach(([key, value]) => {
			callback(value.toString(), key);
		});
	}

	set(key, value) {
		this.headerList[key.toLowerCase()] = [value];
	}
};
