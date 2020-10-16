/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {log} = require('./console');

/**
 * Prints `message` in a silly banner like this:
 *  ____________________________________
 * (_)                                  `
 *   |                                  |
 *   |   @liferay/changelog-generator   |
 *   |   ============                   |
 *   |                                  |
 *   |   Reporting for duty!            |
 *   |                                  |
 *   |__________________________________|
 *   (_)________________________________)
 *
 */
function printBanner(message) {
	const lines = message.split('\n').map((line) => line.trim());

	const width = lines.reduce((max, line) => {
		return Math.max(max, line.length);
	}, 0);

	const TEMPLATE = [
		[' _____', '_', '___  '],
		['(_)   ', ' ', '   ` '],
		['  |   ', '*', '   | '],
		['  |___', '_', '___| '],
		['  (_)_', '_', '____)'],
	];

	let banner = '';

	TEMPLATE.forEach(([left, middle, right]) => {
		if (middle === '*') {
			lines.forEach((line) => {
				banner +=
					left +
					line +
					' '.repeat(width - line.length) +
					right +
					'\n';
			});
		}
		else {
			banner += left + middle.repeat(width) + right + '\n';
		}
	});

	log(banner);
}

module.exports = printBanner;
