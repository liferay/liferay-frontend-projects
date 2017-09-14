'use strict';

import dom from 'metal-dom';
import Position from '../src/Position';
import PositionTestHelper from './fixture/PositionTestHelper';

describe('Position', function() {
	var paddingElement = dom.buildFragment('<div id="paddingElement" style="height:10000px;width:10000px;position:relative;overflow:auto;"><div style="position:absolute;top:20000px;left:20000px;height:10px;width:10px;"></div></div>').firstChild;

	before(function() {
		document.body.style.margin = '0px';
		dom.enterDocument(paddingElement);
	});

	after(function() {
		dom.exitDocument(paddingElement);
	});

	describe('viewport', function() {
		it('should check window viewport size', PositionTestHelper.skipSafariMobile(function() {
			assert.ok(window.document.documentElement.scrollHeight > Position.getClientHeight(window));
			assert.ok(window.document.documentElement.scrollWidth > Position.getClientWidth(window));
		}));

		it('should client size of window be the same of window size', function() {
			assert.strictEqual(Position.getClientHeight(window), Position.getHeight(window));
			assert.strictEqual(Position.getClientWidth(window), Position.getWidth(window));
		});

		it('should check viewport region', function() {
			var height = Position.getClientHeight(window);
			var width = Position.getClientWidth(window);
			var region = Position.getRegion(window);
			assert.strictEqual(height, region.height);
			assert.strictEqual(height, region.bottom);
			assert.strictEqual(width, region.width);
			assert.strictEqual(width, region.right);
			assert.strictEqual(0, region.left);
			assert.strictEqual(0, region.top);
		});
	});

	describe('Size', function() {
		it('should check document size', function() {
			assert.strictEqual(10000, Position.getHeight(document));
			assert.strictEqual(10000, Position.getWidth(document));
		});

		it('should check document client size', function() {
			assert.strictEqual(Position.getClientHeight(document), Position.getHeight(window));
			assert.strictEqual(Position.getClientWidth(document), Position.getWidth(window));
		});

		it('should check element size', function() {
			assert.strictEqual(20010, Position.getHeight(paddingElement));
			assert.strictEqual(20010, Position.getWidth(paddingElement));
		});

		it('should check element client size', function() {
			var scrollbarWidth = Position.getRegion(paddingElement).width - Position.getClientWidth(paddingElement);
			assert.strictEqual(10000 - scrollbarWidth, Position.getClientHeight(paddingElement));
			assert.strictEqual(10000 - scrollbarWidth, Position.getClientWidth(paddingElement));
		});
	});

	describe('Scroll', function() {
		it('should check element scroll size', function(done) {
			nextScrollTick(function() {
				assert.strictEqual(100, Position.getScrollTop(paddingElement));
				assert.strictEqual(100, Position.getScrollLeft(paddingElement));
				done();
			}, paddingElement);
			paddingElement.scrollTop = 100;
			paddingElement.scrollLeft = 100;
		});

		it('should get document scrollLeft and scrollTop', PositionTestHelper.skipSafariMobile(function(done) {
			document.body.style.height = '2000px';
			document.body.style.width = '2000px';
			nextScrollTick(function() {
				assert.strictEqual(20, Position.getScrollTop(document));
				assert.strictEqual(30, Position.getScrollLeft(document));
				assert.strictEqual(20, Position.getScrollTop(window));
				assert.strictEqual(30, Position.getScrollLeft(window));

				nextScrollTick(done);
				window.scrollTo(0, 0);
			});
			window.scrollTo(30, 20);
		}));
	});

	describe('Region', function() {
		it('should check document region', function() {
			var height = Position.getHeight(document);
			var width = Position.getWidth(document);
			var region = Position.getRegion(document);
			assert.strictEqual(height, region.height);
			assert.strictEqual(height, region.bottom);
			assert.strictEqual(width, region.width);
			assert.strictEqual(width, region.right);
			assert.strictEqual(0, region.left);
			assert.strictEqual(0, region.top);
		});

		it('should get node region', function() {
			var region = Position.getRegion(paddingElement);
			assert.strictEqual(10000, region.height);
			assert.strictEqual(10000, region.width);
			assert.strictEqual(10000, region.right);
			assert.strictEqual(10000, region.bottom);
			assert.strictEqual(0, region.left);
			assert.strictEqual(0, region.top);
		});

		it('should get node region excluding the scroll position', PositionTestHelper.skipSafariMobile(function(done) {
			document.body.style.height = '2000px';
			document.body.style.width = '2000px';
			window.scrollTo(30, 20);

			dom.once(document, 'scroll', function() {
				var region = Position.getRegion(paddingElement);
				assert.strictEqual(10000, region.height);
				assert.strictEqual(10000, region.width);
				assert.strictEqual(9970, region.right);
				assert.strictEqual(9980, region.bottom);
				assert.strictEqual(-30, region.left);
				assert.strictEqual(-20, region.top);

				dom.once(document, 'scroll', function() {
					document.body.style.height = '';
					document.body.style.width = '';
					done();
				});
				window.scrollTo(0, 0);
			});
		}));

		it('should get node region including the scroll position', PositionTestHelper.skipSafariMobile(function(done) {
			document.body.style.height = '2000px';
			document.body.style.width = '2000px';
			document.body.style.overflow = 'scroll';
			window.scrollTo(30, 20);

			dom.once(document, 'scroll', function() {
				var region = Position.getRegion(paddingElement, true);
				assert.strictEqual(10000, region.height);
				assert.strictEqual(10000, region.width);
				assert.strictEqual(10000, region.right);
				assert.strictEqual(10000, region.bottom);
				assert.strictEqual(0, region.left);
				assert.strictEqual(0, region.top);

				dom.once(document, 'scroll', function() {
					document.body.style.height = '';
					document.body.style.width = '';
					done();
				});
				window.scrollTo(0, 0);
			});
		}));

		it('should check if same region intersects', function() {
			var r1 = {
				top: 0,
				left: 0,
				bottom: 100,
				right: 100
			};
			var r2 = {
				top: 0,
				left: 0,
				bottom: 100,
				right: 100
			};
			assert.ok(Position.intersectRegion(r1, r2));
		});

		it('should check if inner region intersects', function() {
			var r1 = {
				top: 0,
				left: 0,
				bottom: 100,
				right: 100
			};
			var r2 = {
				top: 50,
				left: 50,
				bottom: 75,
				right: 75
			};
			assert.ok(Position.intersectRegion(r1, r2));
			assert.ok(Position.intersectRegion(r2, r1));
		});

		it('should check if negative region intersects', function() {
			var r1 = {
				top: 0,
				left: 0,
				bottom: 100,
				right: 100
			};
			var r2 = {
				top: -1,
				left: -1,
				bottom: 101,
				right: 101
			};
			assert.ok(Position.intersectRegion(r1, r2));
			assert.ok(Position.intersectRegion(r2, r1));
		});

		it('should check if external region do not intersect', function() {
			var r1 = {
				top: 0,
				left: 0,
				bottom: 100,
				right: 100
			};
			var r2 = {
				top: 101,
				left: 101,
				bottom: 200,
				right: 200
			};
			assert.ok(!Position.intersectRegion(r1, r2));
			assert.ok(!Position.intersectRegion(r2, r1));
		});

		it('should check if same region is considered inside region', function() {
			var r1 = {
				top: 0,
				left: 0,
				bottom: 100,
				right: 100
			};
			var r2 = {
				top: 0,
				left: 0,
				bottom: 100,
				right: 100
			};
			assert.ok(Position.insideRegion(r1, r2));
		});

		it('should check if inner region is considered inside region', function() {
			var r1 = {
				top: 0,
				left: 0,
				bottom: 100,
				right: 100
			};
			var r2 = {
				top: 50,
				left: 50,
				bottom: 75,
				right: 75
			};
			assert.ok(Position.insideRegion(r1, r2));
			assert.ok(!Position.insideRegion(r2, r1));
		});

		it('should check if partially intersected region is not considered inside region', function() {
			var r1 = {
				top: 0,
				left: 0,
				bottom: 100,
				right: 100
			};
			var r2 = {
				top: 100,
				left: 100,
				bottom: 101,
				right: 101
			};
			assert.ok(!Position.insideRegion(r1, r2));
			assert.ok(!Position.insideRegion(r2, r1));
		});

		it('should check if external region is not considered inside region', function() {
			var r1 = {
				top: 0,
				left: 0,
				bottom: 100,
				right: 100
			};
			var r2 = {
				top: 101,
				left: 101,
				bottom: 200,
				right: 200
			};
			assert.ok(!Position.insideRegion(r1, r2));
			assert.ok(!Position.insideRegion(r2, r1));
		});

		it('should check if region inside viewport is not considered inside viewport region', function() {
			var region = {
				top: 0,
				left: 0,
				bottom: 100,
				right: 100
			};
			assert.ok(Position.insideViewport(region));
		});

		it('should check if region outside viewport is not considered inside viewport region', function() {
			var region = {
				top: -1,
				left: -1,
				bottom: 100,
				right: 100
			};
			assert.ok(!Position.insideViewport(region));
		});

		it('should intersection between two equivalent regions be the same region', function() {
			var r1 = {
				bottom: 100,
				height: 100,
				left: 0,
				right: 100,
				top: 0,
				width: 100
			};
			var r2 = {
				bottom: 100,
				height: 100,
				left: 0,
				right: 100,
				top: 0,
				width: 100
			};
			assert.deepEqual(r1, Position.intersection(r1, r2));
		});

		it('should computes the intersection between two regions', function() {
			var r1 = {
				bottom: 100,
				height: 100,
				left: 0,
				right: 100,
				top: 0,
				width: 100
			};
			var r2 = {
				bottom: 50,
				height: 50,
				left: 0,
				right: 50,
				top: 0,
				width: 50
			};
			assert.deepEqual(r2, Position.intersection(r1, r2));
		});

		it('should the intersection between two external regions empty', function() {
			var r1 = {
				top: 0,
				left: 0,
				bottom: 100,
				right: 100
			};
			var r2 = {
				top: 101,
				left: 101,
				bottom: 200,
				right: 200
			};
			assert.isNull(Position.intersection(r1, r2));
		});

		it('should check if a point is inside a region', function() {
			var r = {
				top: 0,
				left: 0,
				bottom: 100,
				right: 100
			};
			assert.ok(Position.pointInsideRegion(0, 0, r));
			assert.ok(Position.pointInsideRegion(0, 100, r));
			assert.ok(Position.pointInsideRegion(100, 0, r));
			assert.ok(Position.pointInsideRegion(100, 100, r));
			assert.ok(Position.pointInsideRegion(50, 50, r));
			assert.ok(!Position.pointInsideRegion(-1, -1, r));
			assert.ok(!Position.pointInsideRegion(101, 101, r));
		});
	});

	describe('offsetTop/offsetLeft', function() {
		var offsetElement;

		beforeEach(function() {
			dom.removeChildren(document.body);
			offsetElement = dom.buildFragment('<div style="position:absolute;top:100px;left:200px;"></div>').firstChild;
			dom.enterDocument(offsetElement);
		});

		afterEach(function() {
			dom.exitDocument(offsetElement);
		});

		it('should return offset position of given element', function() {
			assert.strictEqual(100, Position.getOffsetTop(offsetElement));
			assert.strictEqual(200, Position.getOffsetLeft(offsetElement));
		});

		it('should return offset position of given element with translate css', function() {
			offsetElement.style['-webkit-transform'] = 'translate(-30px, -50px)';
			offsetElement.style['-ms-transform'] = 'translate(-30px, -50px)';
			offsetElement.style.transform = 'translate(-30px, -50px)';
			assert.strictEqual(50, Position.getOffsetTop(offsetElement));
			assert.strictEqual(170, Position.getOffsetLeft(offsetElement));
		});

		it('should return offset position of given element with 3d translate css', function() {
			offsetElement.style['-webkit-transform'] = 'translate3d(-30px, -50px, -10px)';
			offsetElement.style['-ms-transform'] = 'translate3d(-30px, -50px, -10px)';
			offsetElement.style.transform = 'translate3d(-30px, -50px, -10px)';
			if (Position.getTransformMatrixValues(offsetElement)) {
				// This test only makes sense on browsers that support 3d transforms.
				assert.strictEqual(50, Position.getOffsetTop(offsetElement));
				assert.strictEqual(170, Position.getOffsetLeft(offsetElement));
			}
		});

		it('should return offset position of given element ignoring translate css', function() {
			offsetElement.style['-webkit-transform'] = 'translate(-30px, -50px)';
			offsetElement.style['-ms-transform'] = 'translate(-30px, -50px)';
			offsetElement.style.transform = 'translate(-30px, -50px)';
			assert.strictEqual(100, Position.getOffsetTop(offsetElement, true));
			assert.strictEqual(200, Position.getOffsetLeft(offsetElement, true));
		});
	});
});

var nextScrollTick = function(fn, opt_el) {
	var handler = dom.on(opt_el || document, 'scroll', function() {
		fn();
		handler.removeListener();
	});
};
