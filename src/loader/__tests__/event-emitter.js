import EventEmitter from '../event-emitter';

const {log, warn} = console;

describe('EventEmitter', function() {
	beforeEach(() => {
		console.log = jest.fn();
		console.warn = jest.fn();
	});

	afterEach(() => {
		console.log = log;
		console.warn = warn;
	});

	it('should add listeners to events', function() {
		const eventEmitter = new EventEmitter();

		let listener = jest.fn();
		let listener2 = jest.fn();

		eventEmitter.on('test', listener);
		eventEmitter.on('test', listener2);

		expect(eventEmitter._events.test).toBeDefined();
		expect(eventEmitter._events.test).toEqual([listener, listener2]);
	});

	it('should invoke listeners on emit', function() {
		const eventEmitter = new EventEmitter();

		let listener = jest.fn();
		let listener2 = jest.fn();

		eventEmitter.on('test', listener);
		eventEmitter.on('test2', listener2);

		eventEmitter.emit('test');

		expect(listener.mock.calls).toHaveLength(1);
		expect(listener2.mock.calls).toHaveLength(0);

		eventEmitter.emit('test2');

		expect(listener.mock.calls).toHaveLength(1);
		expect(listener2.mock.calls).toHaveLength(1);

		// Check if event emitter calls the listeners with the correct params
		let arg = {
			test: 1,
		};

		eventEmitter.emit('test', arg);

		expect(listener.mock.calls).toHaveLength(2);
		expect(listener2.mock.calls).toHaveLength(1);
		expect(listener.mock.calls[1]).toEqual([arg]);
	});

	it('should remove listeners', function() {
		const eventEmitter = new EventEmitter();

		let listener = jest.fn();
		let listener2 = jest.fn();

		eventEmitter.on('test', listener);
		eventEmitter.on('test', listener2);

		eventEmitter.off('test', listener);

		eventEmitter.emit('test');

		expect(listener.mock.calls).toHaveLength(0);
		expect(listener2.mock.calls).toHaveLength(1);

		eventEmitter.off('test', listener2);

		eventEmitter.emit('test');

		expect(listener2.mock.calls).toHaveLength(1);
	});

	it('should warn when detaching non attached listeners', function() {
		const eventEmitter = new EventEmitter();

		eventEmitter.off('test', jest.fn());
		expect(console.warn.mock.calls).toHaveLength(1);

		let listener = jest.fn();

		eventEmitter.on('test', listener);
		eventEmitter.off('test', jest.fn());

		expect(console.warn.mock.calls).toHaveLength(2);
	});

	it('should warn when emitting event without listeners', function() {
		const eventEmitter = new EventEmitter();

		eventEmitter.emit('test');

		expect(console.warn.mock.calls).toHaveLength(1);
	});

	it(
		'should call all listeners if some of them are being removed on the ' +
			'fly',
		function() {
			const eventEmitter = new EventEmitter();

			const listener1 = jest
				.fn()
				.mockImplementation(() => eventEmitter.off(listener1));

			const listener2 = jest
				.fn()
				.mockImplementation(() => eventEmitter.off(listener2));

			const listener3 = jest
				.fn()
				.mockImplementation(() => eventEmitter.off(listener3));

			eventEmitter.on('test', listener1);
			eventEmitter.on('test', listener2);
			eventEmitter.on('test', listener3);

			eventEmitter.emit('test');

			expect(listener1.mock.calls).toHaveLength(1);
			expect(listener2.mock.calls).toHaveLength(1);
			expect(listener3.mock.calls).toHaveLength(1);
		}
	);
});
