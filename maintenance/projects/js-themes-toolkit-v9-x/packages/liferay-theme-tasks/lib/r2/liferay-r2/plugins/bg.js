/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

var urlLeft = /(?!left.*\/)(left)(?=.*\))/g,
	urlRight = /(?!right.*\/)(right)(?=.*\))/g,
	leftRe = /\s(left)\s/,
	rightRe = /\s(right)\s/,
	percRe = /(\d+)%/,
	plug = function(r2) {
		var r2bgimage = function(v) {
			if (urlLeft.test(v)) {
				v = v.replace(urlLeft, 'right');
			} else if (urlRight.test(v)) {
				v = v.replace(urlRight, 'left');
			}

			return v;
		};

		var r2bg = function(v) {
			v = r2bgimage(v);

			if (v.match(leftRe)) {
				v = v.replace(leftRe, ' right ');
			} else if (v.match(rightRe)) {
				v = v.replace(rightRe, ' left ');
			} else {
				var match = percRe.exec(v);

				if (match) {
					v = v.replace(percRe, 100 - match[1] + '%');
				}
			}

			return v;
		};

		r2.valueMap['background'] = r2bg;
		r2.valueMap['background-image'] = r2bgimage;
	};

module.exports.plug = plug;
