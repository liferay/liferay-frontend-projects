/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

Loader.define(
	'issue-140/m1',
	['module', 'require', 'issue-140/a', './a', 'mapped-issue-140/a'],
	function (module, require) {
		module.exports = function () {
			const result = {};

			try {
				result.standard = 'standard:' + require('issue-140/a');
			}
			catch (error) {
				result.standard = error;
			}

			try {
				result.local = 'local:' + require('./a');
			}
			catch (error) {
				result.local = error;
			}

			try {
				result.mapped = 'mapped:' + require('mapped-issue-140/a');
			}
			catch (error) {
				result.mapped = error;
			}

			return result;
		};
	}
);
