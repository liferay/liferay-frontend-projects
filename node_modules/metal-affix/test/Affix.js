'use strict';

import dom from 'metal-dom';
import Position from 'metal-position';
import Affix from '../src/Affix';

var affix;
var scrollElement;
var element;
var elementInsideContainer;

describe('Affix', function() {
	before(function() {
		dom.enterDocument('<style id="style">body{margin:0;padding:0;}');
	});

	after(function() {
		dom.exitDocument(element);
		dom.exitDocument(scrollElement);
		dom.exitDocument(dom.toElement('#style'));
	});

	afterEach(function() {
		if (affix) {
			affix.dispose();
		}
		if (scrollElement) {
			scrollElement.scrollTop = 0;
		}
		window.scrollTo(0, 0);
	});

	before(function() {
		dom.enterDocument('<div id="affixElement" style="position:relative;top:100px;height:16px;">Element</div>');
		dom.enterDocument('<div id="scrollElement" style="position:relative;height:10000px;overflow:auto;"><div id="affixElementInsideContainer" style="position:relative;top:20000px;height:16px;">Element</div></div>');
		scrollElement = dom.toElement('#scrollElement');
		element = dom.toElement('#affixElement');
		elementInsideContainer = dom.toElement('#affixElementInsideContainer');
	});

	it('should never set affix-top when offsetTop not specified', function(done) {
		affix = new Affix({
			element: element
		});
		window.scrollTo(0, 100);
		nextScrollTick(function() {
			assert.ok(dom.hasClass(affix.element, 'affix'));
			assert.ok(!dom.hasClass(affix.element, 'affix-top'));
			done();
		});
	});

	it('should never set affix-bottom when offsetBottom not specified', function(done) {
		affix = new Affix({
			element: element
		});
		window.scrollTo(0, Position.getHeight(document));
		nextScrollTick(function() {
			assert.ok(dom.hasClass(affix.element, 'affix'));
			assert.ok(!dom.hasClass(affix.element, 'affix-bottom'));
			done();
		});
	});

	it('should set affix-top when reaches offsetTop', function() {
		affix = new Affix({
			element: element,
			offsetTop: 100
		});
		assert.ok(dom.hasClass(affix.element, 'affix-top'));
	});

	it('should restore class to affix when is not on offsetTop', function(done) {
		affix = new Affix({
			element: element,
			offsetTop: 50
		});
		assert.ok(dom.hasClass(affix.element, 'affix-top'));
		window.scrollTo(0, 51);
		nextScrollTick(function() {
			assert.ok(dom.hasClass(affix.element, 'affix'));
			window.scrollTo(0, 0);
			nextScrollTick(function() {
				assert.ok(dom.hasClass(affix.element, 'affix-top'));
				done();
			});
		});
	});

	it('should set affix-bottom when reaches offsetBottom', function(done) {
		affix = new Affix({
			element: element,
			offsetBottom: 0
		});
		window.scrollTo(0, Position.getHeight(document) - Position.getHeight(window));
		nextScrollTick(function() {
			assert.ok(dom.hasClass(affix.element, 'affix-bottom'));
			done();
		});
	});

	it('should restore class to affix when is not on offsetBottom', function(done) {
		affix = new Affix({
			element: element,
			offsetBottom: 0
		});
		assert.ok(dom.hasClass(affix.element, 'affix'));
		window.scrollTo(0, Position.getHeight(document) - Position.getHeight(window));
		nextScrollTick(function() {
			assert.ok(dom.hasClass(affix.element, 'affix-bottom'));
			window.scrollTo(0, Position.getHeight(document) - Position.getHeight(window) - 1);
			nextScrollTick(function() {
				assert.ok(dom.hasClass(affix.element, 'affix'));
				done();
			});
		});
	});

	it('should set affix-top when reaches offsetTop inside scrollElement', function(done) {
		affix = new Affix({
			element: elementInsideContainer,
			scrollElement: scrollElement,
			offsetTop: 10
		});
		scrollElement.scrollTop = 5;
		nextScrollTick(function() {
			assert.ok(dom.hasClass(affix.element, 'affix-top'));
			done();
		}, scrollElement);
	});

	it('should set affix-bottom when reaches offsetBottom inside scrollElement', function(done) {
		affix = new Affix({
			element: elementInsideContainer,
			scrollElement: scrollElement,
			offsetBottom: 0
		});
		scrollElement.scrollTop = Position.getHeight(scrollElement);
		nextScrollTick(function() {
			affix.checkPosition();
			assert.ok(dom.hasClass(affix.element, 'affix-bottom'));
			done();
		}, scrollElement);
	});
});

var nextScrollTick = function(fn, opt_el) {
	var handler = dom.on(opt_el || document, 'scroll', function() {
		fn();
		handler.removeListener();
	});
};
