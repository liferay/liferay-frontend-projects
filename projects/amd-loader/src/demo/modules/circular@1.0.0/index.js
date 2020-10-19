/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

Liferay.Loader.define(
	'circular@1.0.0/index',
	['exports', 'require', './egg', './chicken'],
	function (exports, require) {
		exports.default = function () {
			var Chicken = require('./chicken');

			var chicken = new Chicken.default();

			var egg = chicken.layEgg();

			var newChicken = egg.hatch();

			newChicken.layEgg();
		};
	}
);
