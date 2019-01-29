import ResolvablePromise from '../resolvable-promise';

describe('ResolvablePromise', () => {
	let resolvablePromise;

	beforeEach(() => {
		resolvablePromise = ResolvablePromise.new();
		resolvablePromise.catch(() => {});
	});

	it('should be allowed to fulfill with resolve just once', () => {
		resolvablePromise.resolve();

		expect(() => resolvablePromise.resolve()).toThrow();
		expect(() => resolvablePromise.reject()).toThrow();
	});

	it('should be allowed to fulfill with reject just once', () => {
		resolvablePromise.reject();

		expect(() => resolvablePromise.resolve()).toThrow();
		expect(() => resolvablePromise.reject()).toThrow();
	});

	it('resolve should invoke pre and post registered thens', done => {
		let preCalled;
		let postCalled;

		resolvablePromise.then(() => (preCalled = 'pre'));

		resolvablePromise.resolve();

		resolvablePromise.then(() => (postCalled = 'post'));

		setTimeout(() => {
			expect(preCalled).toBe('pre');
			expect(postCalled).toBe('post');
			done();
		}, 100);
	});

	it('reject should invoke pre and post registered catchs', done => {
		let preCalled;
		let postCalled;

		resolvablePromise.catch(() => (preCalled = 'pre'));

		resolvablePromise.reject();

		resolvablePromise.catch(() => (postCalled = 'post'));

		setTimeout(() => {
			expect(preCalled).toBe('pre');
			expect(postCalled).toBe('post');
			done();
		}, 100);
	});

	it('resolve should set fulfillment state', () => {
		const resolution = 'x';

		resolvablePromise.resolve(resolution);

		expect(resolvablePromise.fulfilled).toBe(true);
		expect(resolvablePromise.resolved).toBe(true);
		expect(resolvablePromise.rejected).toBe(false);
		expect(resolvablePromise.resolution).toBe(resolution);
		expect(resolvablePromise.rejection).toBeUndefined();
	});

	it('reject should set fulfillment state', () => {
		const rejection = new Error();

		resolvablePromise.reject(rejection);

		expect(resolvablePromise.fulfilled).toBe(true);
		expect(resolvablePromise.resolved).toBe(false);
		expect(resolvablePromise.rejected).toBe(true);
		expect(resolvablePromise.resolution).toBeUndefined();
		expect(resolvablePromise.rejection).toBe(rejection);
	});
});
