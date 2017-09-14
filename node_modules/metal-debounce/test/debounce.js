'use strict';

import { cancelDebounce, debounce } from '../src/debounce';

describe('debounce', function() {
	it('should only call received function with the last called args after a delay', function(done) {
		var fn = sinon.stub();

		var debounced = debounce(fn, 200);
		debounced(1, 2, 3);
		debounced(4, 5, 6);

		setTimeout(function() {
			debounced(7, 8, 9);
			debounced(10, 11, 12);
			setTimeout(function() {
				assert.strictEqual(1, fn.callCount);
				assert.deepEqual([10, 11, 12], fn.args[0]);
				done();
			}, 210);
		}, 100);
	});

	it('should call original function with its original context', function(done) {
		var expectedContext = {};
		var context;
		var fn = function() {
			context = this;
		};

		var debounced = debounce(fn.bind(expectedContext), 200);
		debounced(1, 2, 3);

		setTimeout(function() {
			assert.strictEqual(expectedContext, context);
			done();
		}, 200);
	});

	it('should only call received function with the last called args after a delay', function(done) {
		var fn = sinon.stub();

		var debounced = debounce(fn, 200);
		debounced(1, 2, 3);
		cancelDebounce(debounced);

		setTimeout(function() {
			assert.strictEqual(0, fn.callCount);
			done();
		}, 210);
	});
});
