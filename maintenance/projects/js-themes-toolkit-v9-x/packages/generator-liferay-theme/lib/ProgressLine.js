/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

module.exports = class ProgressLine {
	constructor() {
		this._lastLineLength = 0;
	}

	update({percent, total, transferred}) {
		const out = process.stdout;

		let line = '';

		line += `${(transferred / 1000000).toFixed(2)}MB `;
		line += total ? `of ${(total / 1000000).toFixed(2)}MB ` : '';
		line += 'transferred';
		line += total ? ` (${(percent * 100).toFixed(1)}%)` : '';

		out.write(' '.repeat(this._lastLineLength));
		out.write('\r');
		out.write(line);
		out.write('\r');

		this._lastLineLength = line.length;
	}

	finish() {
		const out = process.stdout;

		out.write(' '.repeat(this._lastLineLength));
		out.write('\r');

		this._lastLineLength = 0;
	}
};
