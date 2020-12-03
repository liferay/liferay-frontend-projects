/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

var swapIcons = {
		f053: 'f054',
		f054: 'f053',
		f060: 'f061',
		f061: 'f060',
		f0a4: 'f0a5',
		f0a5: 'f0a4',
		f0a8: 'f0a9',
		f0a9: 'f0a8',
		f0d9: 'f0da',
		f0da: 'f0d9',
		f100: 'f101',
		f101: 'f100',
		f104: 'f105',
		f105: 'f104',
		f137: 'f138',
		f138: 'f137',
		f177: 'f178',
		f178: 'f177',
	},
	contentRegexp = /^"\\(.*)"$/,
	plug = function(r2) {
		r2.valueMap['content'] = function(v) {
			if (contentRegexp.test(v)) {
				const icon = contentRegexp.exec(v)[1];

				if (swapIcons[icon]) {
					v = '"\\' + swapIcons[icon] + '"';
				}
			}

			return v;
		};
	};

module.exports.plug = plug;
