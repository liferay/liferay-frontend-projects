'use strict';

import Ajax from '../src/Ajax';
import { MultiMap } from 'metal-structs';

describe('Ajax', function() {

	describe('Utils', function() {

		it('should parse response headers', function() {
			var headers = 'Name\u003a\u0020Value\u000d\u000aName\u003a\u0020Value';
			assert.deepEqual([{
				name: 'Name',
				value: 'Value'
			}, {
				name: 'Name',
				value: 'Value'
			}], Ajax.parseResponseHeaders(headers));
		});

		it('should return empty array when parsing empty response headers', function() {
			var headers = '';
			assert.deepEqual([], Ajax.parseResponseHeaders(headers));
		});

	});

	describe('Request', function() {

		beforeEach(function() {
			this.xhr = sinon.useFakeXMLHttpRequest();

			var requests = this.requests = [];

			this.xhr.onCreate = function(xhr) {
				requests.push(xhr);
			};
		});

		afterEach(function() {
			this.xhr.restore();
		});

		it('should send request without passing url or method', function(done) {
			Ajax.request().then(function(xhrResponse) {
				assert.strictEqual('/', xhrResponse.url);
				assert.strictEqual('GET', xhrResponse.method);
				done();
			});
			this.requests[0].respond(200);
		});

		it('should send request to an url', function(done) {
			Ajax.request('/url').then(function(xhrResponse) {
				assert.strictEqual('/url', xhrResponse.url);
				done();
			});
			this.requests[0].respond(200);
		});

		it('should cancel send request to an url', function(done) {
			var self = this;
			Ajax.request('/url')
				.then(function() {
					assert.fail();
				})
				.catch(function() {
					assert.ok(self.requests[0].aborted);
					done();
				})
				.cancel();
		});

		it('should send request with credentials', function(done) {
			let withCredentials = true;
			Ajax.request('/url', 'POST', null, null, null, null, false, withCredentials)
				.then(function(xhrResponse) {
					assert.ok(xhrResponse.withCredentials);
					done();
				});
			this.requests[0].respond(200);
		});

		it('should send request without credentials', function(done) {
			let withCredentials = false;
			Ajax.request('/url', 'POST', null, null, null, null, false, withCredentials)
				.then(function(xhrResponse) {
					assert.notOk(xhrResponse.withCredentials);
					done();
				});
			this.requests[0].respond(200);
		});

		it('should send request with different http method', function(done) {
			Ajax.request('/url', 'POST')
				.then(function(xhrResponse) {
					assert.strictEqual('POST', xhrResponse.method);
					done();
				});
			this.requests[0].respond(200);
		});

		it('should send request with body', function(done) {
			Ajax.request('/url', 'post', 'requestBody')
				.then(function(xhrResponse) {
					assert.strictEqual('requestBody', xhrResponse.requestBody);
					assert.strictEqual('responseBody', xhrResponse.response);
					done();
				});
			this.requests[0].respond(200, null, 'responseBody');
		});

		it('should send request with header', function(done) {
			var headers = new MultiMap();
			headers.add('content-type', 'application/json');
			Ajax.request('/url', 'get', null, headers)
				.then(function(xhrResponse) {
					assert.deepEqual({
						'content-type': 'application/json'
					}, xhrResponse.requestHeaders);
					done();
				});
			this.requests[0].respond(200);
		});

		it('should send request with multiple headers with same name', function(done) {
			var headers = new MultiMap();
			headers.add('content-type', 'application/json');
			headers.add('content-type', 'text/html');
			Ajax.request('/url', 'get', null, headers)
				.then(function(xhrResponse) {
					assert.deepEqual({
						'content-type': 'application/json, text/html'
					}, xhrResponse.requestHeaders);
					done();
				});
			this.requests[0].respond(200);
		});

		it('should response with headers', function(done) {
			Ajax.request('/url')
				.then(function(xhrResponse) {
					assert.deepEqual({
						'content-type': 'application/json'
					}, xhrResponse.responseHeaders);
					done();
				});
			this.requests[0].respond(200, {
				'content-type': 'application/json'
			});
		});

		it('should response success with any status code', function(done) {
			Ajax.request('/url').then(function(xhrResponse) {
				assert.strictEqual(500, xhrResponse.status);
				done();
			});
			this.requests[0].respond(500);
		});

		it('should parse request query string', function(done) {
			var params = new MultiMap();
			params.add('query', 1);
			params.add('query', ' ');
			Ajax.request('/url?foo=1', 'get', null, null, params, null, false)
				.then(function(xhrResponse) {
					assert.strictEqual('/url?foo=1&query=1&query=%20', xhrResponse.url);
					done();
				});
			this.requests[0].respond(200);
		});

		it('should parse request query string without params', function(done) {
			Ajax.request('/url?foo=1', 'get', null, null, null, null, false)
				.then(function(xhrResponse) {
					assert.strictEqual('/url?foo=1', xhrResponse.url);
					done();
				});
			this.requests[0].respond(200);
		});

		it('should cancel request if given timeout is reached', function(done) {
			Ajax.request('/url?foo=1', 'get', null, null, null, 100, false)
				.catch(function() {
					done();
				});
		});

		it('should fail on request error', function(done) {
			Ajax.request('/url')
				.catch(function(reason) {
					assert.ok(reason instanceof Error);
					done();
				});
			this.requests[0].error();
		});

	});

});
