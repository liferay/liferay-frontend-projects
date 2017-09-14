'use strict';

import { isDef, isDefAndNotNull } from 'metal';
import Uri from 'metal-uri';
import { CancellablePromise as Promise } from 'metal-promise';

class Ajax {

	/**
	 * XmlHttpRequest's getAllResponseHeaders() method returns a string of
	 * response headers according to the format described on the spec:
	 * {@link http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method}.
	 * This method parses that string into a user-friendly name/value pair
	 * object.
	 * @param {string} allHeaders All headers as string.
	 * @return {!Array.<Object<string, string>>}
	 */
	static parseResponseHeaders(allHeaders) {
		var headers = [];
		if (!allHeaders) {
			return headers;
		}
		var pairs = allHeaders.split('\u000d\u000a');
		for (var i = 0; i < pairs.length; i++) {
			var index = pairs[i].indexOf('\u003a\u0020');
			if (index > 0) {
				var name = pairs[i].substring(0, index);
				var value = pairs[i].substring(index + 2);
				headers.push({
					name: name,
					value: value
				});
			}
		}
		return headers;
	}

	/**
	 * Requests the url using XMLHttpRequest.
	 * @param {!string} url
	 * @param {!string} method
	 * @param {?string} body
	 * @param {MultiMap=} opt_headers
	 * @param {MultiMap=} opt_params
	 * @param {number=} opt_timeout
	 * @param {boolean=} opt_sync
	 * @param {boolean=} opt_withCredentials
	 * @return {Promise} Deferred ajax request.
	 * @protected
	 */
	static request(url, method, body, opt_headers, opt_params, opt_timeout, opt_sync, opt_withCredentials) {
		url = url || '';
		method = method || 'GET';

		var request = new XMLHttpRequest();
		var previousReadyState = 0;

		var promise = new Promise(function(resolve, reject) {
			request.onload = function() {
				if (request.aborted) {
					request.onerror();
					return;
				}
				resolve(request);
			};
			request.onreadystatechange = function() {
				if (previousReadyState && previousReadyState < 3 && 4 === request.readyState) {
					request.terminatedPrematurely = true;
				}
				previousReadyState = request.readyState;
			};
			request.onerror = function() {
				var message = 'Request error';
				if (request.terminatedPrematurely) {
					message = 'Request terminated prematurely';
				} 
				var error = new Error(message);
				error.request = request;
				reject(error);
			};
		}).thenCatch(function(reason) {
			request.abort();
			throw reason;
		}).thenAlways(function() {
			clearTimeout(timeout);
		});

		url = new Uri(url);

		if (opt_params) {
			url.addParametersFromMultiMap(opt_params).toString();
		}

		url = url.toString();

		request.open(method, url, !opt_sync);

		if (opt_withCredentials) {
			request.withCredentials = true;
		}

		if (opt_headers) {
			opt_headers.names().forEach(function(name) {
				request.setRequestHeader(name, opt_headers.getAll(name).join(', '));
			});
		}

		request.send(isDef(body) ? body : null);

		if (isDefAndNotNull(opt_timeout)) {
			var timeout = setTimeout(function() {
				promise.cancel('Request timeout');
			}, opt_timeout);
		}

		return promise;
	}

}

export default Ajax;
