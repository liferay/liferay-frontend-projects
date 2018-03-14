import PluginLogger from '../plugin-logger';

describe('when working with messages', () => {
	let log;

	beforeEach(() => {
		log = new PluginLogger();

		log.info('info-source', 'info-thing-1', 'info-thing-2');
		log.error('error-source', 'error-thing-1');
	});

	it('stores them correctly', () => {
		expect(log.messages).toMatchSnapshot();
	});

	it('dumps them as HTML correctly', () => {
		expect(log.toHtml()).toMatchSnapshot();
	});

	it('dumps them as text correctly', () => {
		expect(log.toString()).toMatchSnapshot();
	});
});

describe('when using PlugginLogger registration', () => {
	it('set and gets a registered PluginLogger correctly', () => {
		const logger = new PluginLogger();

		PluginLogger.set('a-key', logger);

		expect(PluginLogger.get('a-key')).toBe(logger);
	});

	it('deletes a registered PluginLogger correctly', () => {
		const logger = new PluginLogger();

		PluginLogger.set('a-key', logger);

		logger.info('source', 'hi');

		expect(PluginLogger.get('a-key').messages.length).toBe(1);

		PluginLogger.delete('a-key');

		expect(PluginLogger.get('a-key').messages.length).toBe(0);
	});

	it('returns a dummy logger if no loggers are registered', () => {
		PluginLogger.delete('a-key');

		expect(PluginLogger.get('a-key')).toBeDefined();
	});
});
