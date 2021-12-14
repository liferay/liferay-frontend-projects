/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

let promise = Promise.resolve();

module.exports = function runSequentially(fn) {
	promise = promise.then(async () => {
		try {
			await fn();
		}
		catch (error) {
			console.error('Error executing fn ', error);
		}
	});

	return promise;
};
