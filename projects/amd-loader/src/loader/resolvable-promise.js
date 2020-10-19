/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * A Promise with resolve() and reject() methods so that it can be fulfilled
 * asynchronously from outside instead of the callback.
 *
 * Because Promise cannot be extended in the usual way, we need to do some
 * magic to define this class.
 */
export default class ResolvablePromise {

	/**
	 * Don't construct ResolvablePromise objects directly: rely on
	 * ResolvablePromise.new() instead.
	 */
	constructor() {
		throw new Error(
			"Don't construct ResolvablePromise objects directly: " +
				'rely on ResolvablePromise.new() instead'
		);
	}
}

ResolvablePromise.new = () => {
	const capture = {};

	const promise = new Promise((resolve, reject) => {
		capture._resolve = resolve;
		capture._reject = reject;
	});

	Object.assign(promise, capture, {
		fulfilled: false,
		rejected: false,
		rejection: undefined,
		resolution: undefined,
		resolved: false,
	});

	promise.resolve = (value) => resolve(promise, value);
	promise.reject = (error) => reject(promise, error);

	// This is to avoid UnhandledPromiseRejectionWarning errors during the tests

	if (typeof jest !== 'undefined') {
		promise.catch(() => {});
	}

	return promise;
};

/**
 * Resolve the promise
 * @param {ResolvablePromise} resolvablePromise
 * @param {*} value
 */
function resolve(resolvablePromise, value) {
	_assertNotFulfilled(resolvablePromise);

	resolvablePromise.fulfilled = true;
	resolvablePromise.resolved = true;
	resolvablePromise.resolution = value;

	resolvablePromise._resolve(value);
}

/**
 * Reject the Promise
 * @param {ResolvablePromise} resolvablePromise
 * @param {Error} error
 */
function reject(resolvablePromise, error) {
	_assertNotFulfilled(resolvablePromise);

	resolvablePromise.fulfilled = true;
	resolvablePromise.rejected = true;
	resolvablePromise.rejection = error;

	resolvablePromise._reject(error);
}

/**
 * Throws if Promise is already fulfilled
 * @param {ResolvablePromise} resolvablePromise
 */
function _assertNotFulfilled(resolvablePromise) {
	if (resolvablePromise.fulfilled) {
		throw new Error('Promise already fulfilled');
	}
}
