'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');

describe('EventEmitter', function() {
	it('should add listeners to events', function() {
		var eventEmitter = new global.EventEmitter();

		var listener = sinon.stub();
		var listener2 = sinon.stub();

		eventEmitter.on('test', listener);
		eventEmitter.on('test', listener2);

		assert.ok(eventEmitter._events.test);
		assert.strictEqual(0, eventEmitter._events.test.indexOf(listener));

		assert.ok(eventEmitter._events.test);
		assert.strictEqual(1, eventEmitter._events.test.indexOf(listener2));
	});

	it('should invoke listeners on emit', function() {
		var eventEmitter = new global.EventEmitter();

		var listener = sinon.stub();
		var listener2 = sinon.stub();

		eventEmitter.on('test', listener);
		eventEmitter.on('test2', listener2);

		eventEmitter.emit('test');

		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(0, listener2.callCount);

		eventEmitter.emit('test2');

		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(1, listener2.callCount);

		// Check if event emitter calls the listeners with the correct params
		var arg = {
			test: 1,
		};

		eventEmitter.emit('test', arg);
		assert.strictEqual(2, listener.callCount);
		assert.strictEqual(1, listener2.callCount);
		assert.strictEqual(true, listener.calledWith(arg));
	});

	it('should remove listeners', function() {
		var eventEmitter = new global.EventEmitter();

		var listener = sinon.stub();
		var listener2 = sinon.stub();

		eventEmitter.on('test', listener);
		eventEmitter.on('test', listener2);

		eventEmitter.off('test', listener);

		eventEmitter.emit('test');

		assert.strictEqual(0, listener.callCount);
		assert.strictEqual(1, listener2.callCount);

		eventEmitter.off('test', listener2);

		eventEmitter.emit('test');

		assert.strictEqual(1, listener2.callCount);
	});

	it('should warn when detaching non attached listeners', function() {
		var eventEmitter = new global.EventEmitter();

		sinon.spy(console, 'warn');

		eventEmitter.off('test', sinon.stub());
		assert.ok(console.warn.called);

		var listener = sinon.stub();
		eventEmitter.on('test', listener);

		eventEmitter.off('test', sinon.stub());
		assert(console.warn.calledTwice);

		console.warn.restore();
	});

	it('should warn when emitting event without listeners', function() {
		var eventEmitter = new global.EventEmitter();

		sinon.spy(console, 'warn');
		eventEmitter.emit('test');
		assert.ok(console.warn.called);
		console.warn.restore();
	});

	it('should call all listeners if some of them are being removed on the fly', function() {
		var eventEmitter = new global.EventEmitter();

		var listener1 = sinon.spy(function() {
			eventEmitter.off(listener1);
		});

		var listener2 = sinon.spy(function() {
			eventEmitter.off(listener2);
		});

		var listener3 = sinon.spy(function() {
			eventEmitter.off(listener3);
		});

		eventEmitter.on('test', listener1);
		eventEmitter.on('test', listener2);
		eventEmitter.on('test', listener3);

		eventEmitter.emit('test');

		assert(listener1.calledOnce);
		assert(listener2.calledOnce);
		assert(listener3.calledOnce);
	});
});
