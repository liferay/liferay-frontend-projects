/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

var eggNumber = 1;

Liferay.Loader.define(
	'circular@1.0.0/egg',
	['exports', 'require', './chicken'],
	function (exports, require, chicken) {
		var Chicken = require('./chicken');

		console.log('Egg module implementing');
		console.log(
			'  - AMD and CommonJS chickens are the same?',
			chicken === Chicken ? 'Yes' : 'No :-('
		);
		console.log(
			'  - CommonJS chicken already defined?',
			Chicken.default !== undefined ? 'Yes' : "Nope, I'm first"
		);

		function Egg() {
			this.eggNumber = eggNumber++;

			console.log('New egg ' + this.eggNumber + ' laid');
		}

		Egg.prototype.hatch = function () {
			console.log('Egg ' + this.eggNumber + ' giving birth to chicken');

			var chicken = new Chicken.default();

			return chicken;
		};

		exports.default = Egg;
	}
);
