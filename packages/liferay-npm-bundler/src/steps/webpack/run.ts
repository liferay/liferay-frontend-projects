/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import webpack from 'webpack';

export default function run(
	options: webpack.Configuration
): Promise<webpack.Stats> {
	return new Promise((resolve, reject) => {
		const compiler = webpack(options);

		compiler.run((err, stats) => {
			if (err) {
				reject(err);
			} else {
				resolve(stats);
			}
		});
	});
}
