/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

module.exports = {
	rules: {
		'no-all': require('./lib/rules/no-all'),
		'no-array': require('./lib/rules/no-array'),
		'no-each': require('./lib/rules/no-each'),
		'no-get-body': require('./lib/rules/no-get-body'),
		'no-io': require('./lib/rules/no-io'),
		'no-merge': require('./lib/rules/no-merge'),
		'no-modal': require('./lib/rules/no-modal'),
		'no-node': require('./lib/rules/no-node'),
		'no-object': require('./lib/rules/no-object'),
		'no-one': require('./lib/rules/no-one'),
	},
};
