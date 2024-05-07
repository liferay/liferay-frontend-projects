/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

var chickenNumber = 1;

Liferay.Loader.define(
	'circular@1.0.0/chicken',
	['exports', 'require', './egg'],
	function (exports, require, egg) {
		var Egg = require('./egg');

		console.log('Chicken module implementing');
		console.log(
			'  - AMD and CommonJS eggs are the same?',
			egg === Egg ? 'Yes' : 'No :-('
		);
		console.log(
			'  - CommonJS egg already defined?',
			Egg.default !== undefined ? 'Yes' : "Nope, I'm first"
		);

		function Chicken() {
			this.chickenNumber = chickenNumber++;

			console.log('New chicken ' + this.chickenNumber + ' born');
		}

		Chicken.prototype.layEgg = function () {
			console.log('Chicken ' + this.chickenNumber + ' laying an egg');

			var egg = new Egg.default();

			return egg;
		};

		exports.default = Chicken;
	}
);
