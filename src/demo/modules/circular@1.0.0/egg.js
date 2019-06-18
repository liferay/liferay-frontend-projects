/**
 * © 2014 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

Liferay.Loader.define(
	'circular@1.0.0/egg',
	['exports', 'require', './chicken'],
	function(exports, require) {
		function Egg() {}

		var Chicken = require('./chicken');

		Egg.prototype.hatch = function() {
			var chicken = new Chicken.default();

			return chicken;
		};

		exports.default = Egg;
	}
);
