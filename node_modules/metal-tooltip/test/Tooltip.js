'use strict';

import { async } from 'metal';
import dom from 'metal-dom';
import Tooltip from '../src/Tooltip';

var tooltip;

describe('Tooltip', function() {
	afterEach(function() {
		if (tooltip) {
			tooltip.dispose();
		}
	});

	it('should render with default state', function() {
		tooltip = new Tooltip();
		assert.strictEqual('', tooltip.element.style.display);
	});

	it('should render with title', function() {
		tooltip = new Tooltip({
			title: 'content'
		});
		const innerElement = tooltip.element.querySelector('.tooltip-inner');
		assert.strictEqual('content', innerElement.innerHTML);
	});

	it('should update when title state changes', function(done) {
		tooltip = new Tooltip();
		tooltip.title = 'content';
		async.nextTick(function() {
			const innerElement = tooltip.element.querySelector('.tooltip-inner');
			assert.strictEqual('content', innerElement.innerHTML);
			done();
		});
	});

	it('should set opacity to 1 when tooltip becomes visible', function(done) {
		tooltip = new Tooltip({
			visible: false
		});
		assert.notStrictEqual('1', tooltip.element.style.opacity);

		tooltip.visible = true;
		tooltip.once('stateSynced', function() {
			assert.strictEqual('1', tooltip.element.style.opacity);
			done();
		});
	});

	it('should set display to none after tooltip hide animation', function(done) {
		tooltip = new Tooltip();
		assert.notStrictEqual('none', tooltip.element.style.display);

		tooltip.visible = false;
		tooltip.once('stateSynced', function() {
			dom.triggerEvent(tooltip.element, 'animationend');
			assert.strictEqual('none', tooltip.element.style.display);
			done();
		});
	});

	it('should not set display to none if tooltip is visible again when hide animation is done', function(done) {
		tooltip = new Tooltip();
		assert.notStrictEqual('none', tooltip.element.style.display);

		tooltip.visible = false;
		tooltip.once('stateSynced', function() {
			tooltip.visible = true;
			dom.triggerEvent(tooltip.element, 'animationend');
			assert.notStrictEqual('none', tooltip.element.style.display);
			done();
		});
	});

	it('should not throw error if tooltip if element is removed before animation is done', function(done) {
		tooltip = new Tooltip();
		tooltip.visible = false;
		tooltip.once('stateSynced', function() {
			const element = tooltip.element;
			tooltip.element = null;
			assert.doesNotThrow(() => {
				dom.triggerEvent(element, 'animationend');
			});
			done();
		});
	});

	it('should not throw error if tooltip if disposed before animation is done', function(done) {
		tooltip = new Tooltip();
		tooltip.visible = false;
		tooltip.once('stateSynced', function() {
			tooltip.dispose();
			sinon.stub(console, 'warn');
			dom.triggerEvent(tooltip.element, 'animationend');
			assert.equal(0, console.warn.callCount);

			console.warn.restore();
			done();
		});
	});

	it('should decorate', function() {
		const element = document.createElement('div');
		dom.enterDocument(element);
		IncrementalDOM.patch(element, () => {
			Tooltip.TEMPLATE({
				id: 'tooltip',
				title: 'content'
			});
		});
		const outerHTML = element.childNodes[0].outerHTML;

		tooltip = new Tooltip({
			element: element.childNodes[0],
			title: 'content',
			visible: false
		});

		assert.strictEqual(tooltip.element.outerHTML, outerHTML);
	});

	it('should get the title from the DOM', function(done) {
		dom.enterDocument('<div id="tooltipTrigger2" data-title="title"></div>');
		const trigger = dom.toElement('#tooltipTrigger2');

		tooltip = new Tooltip({
			selector: '#tooltipTrigger2',
			visible: false
		});

		dom.triggerEvent(trigger, 'mouseover');
		tooltip.on('stateSynced', function(data) {
			if (data.changes.title) {
				const innerElement = tooltip.element.querySelector('.tooltip-inner');
				assert.strictEqual('title', innerElement.innerHTML);
				dom.exitDocument(trigger);
				done();
			}
		});
	});
});
