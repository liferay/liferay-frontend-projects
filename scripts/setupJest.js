/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

/* eslint-env jest */

const {RuleTester} = require('eslint');

RuleTester.describe = describe;

RuleTester.it = function(description, method) {
	const prettifiedDescription = description.replace(
		/\\u0009|\\u000a/g,
		match => {
			if (match === '\\u0009') {
				return '\\t';
			} else {
				return '\\n';
			}
		}
	);

	it(prettifiedDescription, method);
};
