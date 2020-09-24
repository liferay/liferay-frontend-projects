/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-env jest */

afterEach(() => {
	global.fetch.mockRestore();
});

beforeEach(() => {
	jest.spyOn(global, 'fetch').mockImplementation((...args) => {
		throw new Error(
			`global.fetch was not mocked for this call: ${JSON.stringify(args)}`
		);
	});
});
