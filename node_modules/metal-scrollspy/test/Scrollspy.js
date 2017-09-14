'use strict';

import dom from 'metal-dom';
import Scrollspy from '../src/Scrollspy';

var spy;
var element;
var scrollElement;

describe('Scrollspy', function() {
	before(function() {
		dom.enterDocument('<style id="style">body{margin:0;padding:0;}');
	});

	after(function() {
		dom.exitDocument(dom.toElement('#style'));
	});

	afterEach(function() {
		if (spy) {
			spy.dispose();
		}
		if (scrollElement) {
			scrollElement.scrollTop = 0;
		} else {
			window.scrollTo(0, 0);
		}
	});

	describe('Container', function() {
		before(function() {
			dom.enterDocument('<ul id="element" style="position:relative;height:500px;margin:0;">' +
				'<li><a id="element1" href="#link1">link1</a></li>' +
				'<li><a id="element2" href="#link2">link2</a></li>' +
				'<li><a id="element3" href="#link3">link3</a></li>' +
				'<li><a id="element4" href="#link4">link4</a></li>' +
				'<li><a id="element5" href="#link5">link5</a></li></ul>'
			);
			dom.enterDocument('<div id="scrollElement" style="position:relative;height:500px;overflow-y:auto;">' +
				'<div id="link1" style="height:500px;">Link1</div>' +
				'<div id="link2" style="height:500px;">Link2</div>' +
				'<div id="link3" style="height:500px;">Link3</div>' +
				'<div id="link4" style="height:500px;">Link4</div>' +
				'<div id="link5" style="height:500px;">Link5</div></div>'
			);
			element = dom.toElement('#element');
			scrollElement = dom.toElement('#scrollElement');
		});

		after(function() {
			dom.exitDocument(element);
			dom.exitDocument(scrollElement);
			scrollElement = null;
		});

		it('should activate element at offset', function() {
			spy = new Scrollspy({
				element: element,
				scrollElement: scrollElement,
				offset: 0
			});
			assert.ok(dom.hasClass(dom.toElement('#element1'), 'active'));
		});

		it('should activate element when scrolling', function(done) {
			spy = new Scrollspy({
				element: element,
				scrollElement: scrollElement,
				offset: 0
			});
			scrollElement.scrollTop = 500;
			nextScrollTick(function() {
				assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(dom.hasClass(dom.toElement('#element2'), 'active'));

				scrollElement.scrollTop = 1000;
				nextScrollTick(function() {
					assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
					assert.ok(!dom.hasClass(dom.toElement('#element2'), 'active'));
					assert.ok(dom.hasClass(dom.toElement('#element3'), 'active'));

					scrollElement.scrollTop = 1500;
					nextScrollTick(function() {
						assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
						assert.ok(!dom.hasClass(dom.toElement('#element2'), 'active'));
						assert.ok(!dom.hasClass(dom.toElement('#element3'), 'active'));
						assert.ok(dom.hasClass(dom.toElement('#element4'), 'active'));
						done();
					}, scrollElement);
				}, scrollElement);
			}, scrollElement);
		});

		it('should activate element when scrolling at offset', function(done) {
			spy = new Scrollspy({
				element: element,
				scrollElement: scrollElement,
				offset: 100
			});
			scrollElement.scrollTop = 400;
			nextScrollTick(function() {
				assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(dom.hasClass(dom.toElement('#element2'), 'active'));
				done();
			}, scrollElement);
		});

		it('should activate last element when scrolling to maximum position', function(done) {
			spy = new Scrollspy({
				element: element,
				scrollElement: scrollElement,
				offset: 0
			});
			scrollElement.scrollTop = 99999;
			nextScrollTick(function() {
				assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element2'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element3'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element4'), 'active'));
				assert.ok(dom.hasClass(dom.toElement('#element5'), 'active'));
				done();
			}, scrollElement);
		});

		it('should always activate closest element when scrolling', function(done) {
			spy = new Scrollspy({
				element: element,
				scrollElement: scrollElement,
				offset: 0
			});
			scrollElement.scrollTop = 1000;
			nextScrollTick(function() {
				assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element2'), 'active'));
				assert.ok(dom.hasClass(dom.toElement('#element3'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element4'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element5'), 'active'));
				done();
			}, scrollElement);
		});

		it('should update current active index when scroll element is changed', function() {
			spy = new Scrollspy({
				element: element,
				scrollElement: scrollElement,
				offset: 0
			});

			dom.exitDocument(scrollElement);
			dom.enterDocument('<div id="scrollElement" style="position:relative;height:500px;overflow-y:auto;">' +
				'<div id="link2" style="height:500px;">Link2</div>' +
				'<div id="link1" style="height:500px;">Link1</div>' +
				'<div id="link3" style="height:500px;">Link3</div>' +
				'<div id="link4" style="height:500px;">Link4</div>' +
				'<div id="link5" style="height:500px;">Link5</div></div>'
			);
			scrollElement = dom.toElement('#scrollElement');

			spy.scrollElement = scrollElement;
			assert.ok(dom.hasClass(dom.toElement('#element2'), 'active'));
		});

		it('should listen to scrolls on the new scroll element', function(done) {
			spy = new Scrollspy({
				element: element,
				scrollElement: scrollElement,
				offset: 0
			});

			dom.exitDocument(scrollElement);
			dom.enterDocument('<div id="scrollElement" style="position:relative;height:500px;overflow-y:auto;">' +
				'<div id="link2" style="height:500px;">Link2</div>' +
				'<div id="link1" style="height:500px;">Link1</div>' +
				'<div id="link3" style="height:500px;">Link3</div>' +
				'<div id="link4" style="height:500px;">Link4</div>' +
				'<div id="link5" style="height:500px;">Link5</div></div>'
			);
			scrollElement = dom.toElement('#scrollElement');

			spy.scrollElement = scrollElement;
			scrollElement.scrollTop = 1000;
			nextScrollTick(function() {
				assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element2'), 'active'));
				assert.ok(dom.hasClass(dom.toElement('#element3'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element4'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element5'), 'active'));
				done();
			}, scrollElement);
		});
	});

	describe('Document', function() {
		before(function() {
			dom.enterDocument('<div id="contentElement" style="position:relative;">' +
				'<div id="link1" style="height:5000px;">Link1</div>' +
				'<div id="link2" style="height:5000px;">Link2</div>' +
				'<div id="link3" style="height:5000px;">Link3</div>' +
				'<div id="link4" style="height:5000px;">Link4</div></div>');
			dom.enterDocument('<ul id="element">' +
				'<li><a id="element1" href="#link1">link1</a></li>' +
				'<li><a id="elementNoHash" href="/noHash">No Hash</a></li>' +
				'<li><a id="element2" href="#link2">link2</a></li>' +
				'<li><a id="elementNoContent" href="#noContent">No Content</a></li>' +
				'<li><a id="element3" href="#link3">link3</a></li>' +
				'<li><a id="element4" href="#link4">link4</a></li></ul>'
			);
			element = dom.toElement('#element');
		});

		after(function() {
			dom.exitDocument(element);
			dom.exitDocument(dom.toElement('#contentElement'));
		});

		it('should activate element', function() {
			spy = new Scrollspy({
				element: element,
				offset: 0
			});
			assert.ok(dom.hasClass(dom.toElement('#element1'), 'active'));
		});

		it('should not activate any element if scroll position is before all of them', function() {
			dom.toElement('#contentElement').style.marginTop = '50px';
			spy = new Scrollspy({
				element: element,
				offset: 0
			});
			assert.ok(!document.querySelector('.active'));
			dom.toElement('#contentElement').style.marginTop = '0px';
		});

		it('should activate resolved element', function() {
			spy = new Scrollspy({
				element: element,
				offset: 0,
				resolveElement: function(el) {
					return el.parentNode;
				}
			});
			assert.ok(dom.hasClass(dom.toElement('#element1').parentNode, 'active'));
		});

		it('should activate element when scrolling', function(done) {
			spy = new Scrollspy({
				element: element,
				offset: 0
			});
			window.scrollTo(0, 5000);
			nextScrollTick(function() {
				assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(dom.hasClass(dom.toElement('#element2'), 'active'));

				window.scrollTo(0, 10000);
				nextScrollTick(function() {
					assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
					assert.ok(!dom.hasClass(dom.toElement('#element2'), 'active'));
					assert.ok(dom.hasClass(dom.toElement('#element3'), 'active'));

					window.scrollTo(0, 15000);
					nextScrollTick(function() {
						assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
						assert.ok(!dom.hasClass(dom.toElement('#element2'), 'active'));
						assert.ok(!dom.hasClass(dom.toElement('#element3'), 'active'));
						assert.ok(dom.hasClass(dom.toElement('#element4'), 'active'));
						done();
					});
				});
			});
		});

		it('should deactivates all elements when window is scrolled to position before all elements', function(done) {
			dom.toElement('#contentElement').style.marginTop = '50px';
			spy = new Scrollspy({
				element: element,
				offset: 0
			});

			window.scrollTo(0, 50);
			nextScrollTick(function() {
				assert.ok(dom.hasClass(dom.toElement('#element1'), 'active'));

				window.scrollTo(0, 0);
				nextScrollTick(function() {
					assert.ok(!document.querySelector('.active'));
					dom.toElement('#contentElement').style.marginTop = '0px';
					done();
				});
			});
		});

		it('should activate element when scrolling at offset', function(done) {
			spy = new Scrollspy({
				element: element,
				offset: 1000
			});
			window.scrollTo(0, 4000);
			nextScrollTick(function() {
				assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(dom.hasClass(dom.toElement('#element2'), 'active'));
				done();
			});
		});

		it('should update active element when the value of the offset state changes', function(done) {
			spy = new Scrollspy({
				element: element,
				offset: 0
			});
			window.scrollTo(0, 4000);
			nextScrollTick(function() {
				assert.ok(dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element2'), 'active'));

				spy.offset = 1000;
				assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(dom.hasClass(dom.toElement('#element2'), 'active'));
				done();
			});
		});

		it('should activate last element when scrolling to maximum position', function(done) {
			spy = new Scrollspy({
				element: element,
				offset: 0
			});
			window.scrollTo(0, 99999);
			nextScrollTick(function() {
				assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element2'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element3'), 'active'));
				assert.ok(dom.hasClass(dom.toElement('#element4'), 'active'));
				done();
			});
		});

		it('should activate last element when scrolling to maximum position with offset', function(done) {
			spy = new Scrollspy({
				element: element,
				offset: 100
			});
			window.scrollTo(0, 99999);
			nextScrollTick(function() {
				assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element2'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element3'), 'active'));
				assert.ok(dom.hasClass(dom.toElement('#element4'), 'active'));
				done();
			});
		});

		it('should activate index of closest element when scrolling', function(done) {
			spy = new Scrollspy({
				element: element,
				offset: 0
			});
			window.scrollTo(0, 10000);
			nextScrollTick(function() {
				assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element2'), 'active'));
				assert.ok(dom.hasClass(dom.toElement('#element3'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element4'), 'active'));
				done();
			});
		});

		it('should activate the right item on the new element when it changes', function() {
			spy = new Scrollspy({
				element: element,
				offset: 0
			});

			dom.enterDocument('<ul id="newElement">' +
				'<li><a id="newElement1" href="#link1">link1</a></li>' +
				'<li><a id="newElement2" href="#link2">link2</a></li>' +
				'<li><a id="newElement3" href="#link3">link3</a></li>' +
				'<li><a id="newElement4" href="#link4">link4</a></li></ul>'
			);
			spy.element = '#newElement';

			assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
			assert.ok(dom.hasClass(dom.toElement('#newElement1'), 'active'));

			dom.exitDocument(spy.element);
		});

		it('should update active item when the selector changes', function(done) {
			dom.addClasses(dom.toElement('#element1'), 'mySelector');
			dom.addClasses(dom.toElement('#element3'), 'mySelector');

			spy = new Scrollspy({
				element: element,
				offset: 0
			});

			window.scrollTo(0, 5000);
			nextScrollTick(function() {
				assert.ok(!dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(dom.hasClass(dom.toElement('#element2'), 'active'));

				spy.selector = '.mySelector';
				assert.ok(dom.hasClass(dom.toElement('#element1'), 'active'));
				assert.ok(!dom.hasClass(dom.toElement('#element2'), 'active'));
				done();
			});
		});
	});
});

var nextScrollTick = function(fn, opt_el) {
	dom.once(opt_el || document, 'scroll', fn);
};
