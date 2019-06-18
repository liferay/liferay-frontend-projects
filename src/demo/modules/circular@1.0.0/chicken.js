/**
 * © 2014 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

Liferay.Loader.define(
	'circular@1.0.0/chicken',
	['exports', 'require', './egg'],
	function(exports, require) {
		function Chicken() {}

		var Egg = require('./egg');

		Chicken.prototype.layEgg = function() {
			var egg = new Egg.default();

			return egg;
		};

		exports.default = Chicken;
	}
);
