/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

var resizeHandleRegexp = /.yui3-resize-handle/,
	resizeHandleInnerRegexp = /.yui3-resize-handle-inner-(tr|tl|br|bl)/,
	cursorRegexp = /(.*)-resize/,
	swapCursor = {
		'e-resize': 'w-resize',
		'ne-resize': 'nw-resize',
		'nw-resize': 'ne-resize',
		'se-resize': 'sw-resize',
		'sw-resize': 'se-resize',
		'w-resize': 'e-resize',
	},
	swapHandleInnerBg = {
		bl: '-30px 0',
		br: '-75px 0',
		tl: '-58px 0',
		tr: '-47px 0',
	},
	plug = function(r2) {
		var originalBgPosFn = r2.valueMap['background-position'];

		var yui3ResizeCursor = function(v, ctx) {
			var swap = false;

			ctx.rule.selectors.forEach(selector => {
				if (resizeHandleRegexp.test(selector) && cursorRegexp.test(v)) {
					swap = true;
				}
			});

			if (swap) {
				v = swapCursor[v] || v;
			}

			return v;
		};

		var yui3ResizeBgPosition = function(v, ctx) {
			var swap = '';

			ctx.rule.selectors.some(selector => {
				if (resizeHandleInnerRegexp.test(selector)) {
					swap = selector;
					return true;
				}
			});

			if (swap) {
				var handle = resizeHandleInnerRegexp.exec(swap)[1];
				v = swapHandleInnerBg[handle] || v;
			} else {
				v = originalBgPosFn(v, ctx);
			}

			return v;
		};

		var yui3ResizeOffset = function(v, ctx) {
			var swap = '';

			ctx.rule.selectors.some(selector => {
				if (resizeHandleInnerRegexp.test(selector)) {
					swap = selector;
					return true;
				}
			});

			if (swap) {
				v = '2px';
			}

			return v;
		};

		r2.valueMap['background-position'] = yui3ResizeBgPosition;
		r2.valueMap['cursor'] = yui3ResizeCursor;
		r2.valueMap['left'] = yui3ResizeOffset;
		r2.valueMap['right'] = yui3ResizeOffset;
	};

module.exports.plug = plug;
