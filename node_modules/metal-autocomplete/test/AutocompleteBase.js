'use strict';

import dom from 'metal-dom';
import CancellablePromise from 'metal-promise';
import AutocompleteBase from '../src/AutocompleteBase';

var component;
var input;

describe('AutocompleteBase', function() {
	afterEach(function() {
		if (component) {
			component.dispose();
		}
		if (input) {
			dom.exitDocument(input);
		}
	});

	beforeEach(function() {
		input = document.createElement('input');
		input.type = 'text';
		dom.enterDocument(input);
	});

	it('should wrap data value in a function', function() {
		var data = [];
		component = new AutocompleteBase({
			data: data,
			inputElement: input
		});
		assert.isFunction(component.data);
		assert.strictEqual(data, component.data());
	});

	it('should not wrap data value in a function if it is already a function', function() {
		var items = [];
		var data = function() {
			return items;
		};
		component = new AutocompleteBase({
			data: data,
			inputElement: input
		});
		assert.strictEqual(items, component.data());
		assert.strictEqual(data, component.data);
	});

	it('should not throw exception if inputElement is not specified', function() {
		assert.doesNotThrow(function() {
			component = new AutocompleteBase();
		});
	});

	it('should invoke deferred data handler passing the user input as query', function(done) {
		var data = function(query) {
			assert.strictEqual('foo', query);
			done();
		};
		component = new AutocompleteBase({
			data: data,
			inputElement: input
		});
		input.value = 'foo';
		dom.triggerEvent(input, 'input');
	});

	it('should invoke deferred data handler passing the query as argument', function(done) {
		var data = function(query) {
			assert.strictEqual('foo', query);
			done();
		};
		component = new AutocompleteBase({
			data: data,
			inputElement: input
		});
		component.request('foo');
	});

	it('should cancel pending request', function(done) {
		component = new AutocompleteBase({
			data: new CancellablePromise(function() {}),
			inputElement: input
		});
		component.request().catch(function(reason) {
			assert.strictEqual('Cancelled by another request', reason.message);
			done();
		});
		component.request();
	});

	it('should format data items', function(done) {
		var formatter = function(item) {
			return item + 1;
		};
		component = new AutocompleteBase({
			data: [1, 2],
			inputElement: input,
			format: formatter
		});
		component.request().then(function(data) {
			assert.deepEqual([2, 3], data);
			done();
		});
	});

	it('should removes format data items null', function(done) {
		var formatter = function() {
			return null;
		};
		component = new AutocompleteBase({
			data: [1, 2],
			inputElement: input,
			format: formatter
		});
		component.request().then(function(data) {
			assert.deepEqual([], data);
			done();
		});
	});

	it('should removes format data items undefined', function(done) {
		var formatter = function() {
			return undefined;
		};
		component = new AutocompleteBase({
			data: [1, 2],
			inputElement: input,
			format: formatter
		});
		component.request().then(function(data) {
			assert.deepEqual([], data);
			done();
		});
	});

	it('should default select function set value and focus input element', function() {
		component = new AutocompleteBase({
			data: [],
			inputElement: input
		});
		component.emit('select', {
			text: 'foo'
		});
		assert.strictEqual('foo', input.value);
	});

});
