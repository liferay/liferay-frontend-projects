'use strict';

var _ = require('lodash');
var chai = require('chai');
var path = require('path');
var Promise = require('bluebird');
var sinon = require('sinon');

var assert = chai.assert;

describe('WatchSocket', function() {
	var originalCWD;
	var prototype;
	var WatchSocket;

	var responseMap = [
		{
			command: 'grep webbundle:file',
			response: 'lb -u | grep webbundle:file.*base-theme\n' +
				'  474|Resolved   |    1|webbundle:file:///Users/rframpton/Projects/Portal/CE/trunk/osgi/configs/march-2-theme.war?Web-ContextPath=/base-theme\n' +
				'true\n' +
				'g!'
		},
		{
			command: 'grep webbundledir:file',
			response: 'lb -u | grep webbundledir:file.*base-theme\n' +
				'  473|Resolved   |    1|webbundledir:file:///Users/rframpton/Projects/Portal/CE/trunk/osgi/configs/march-2-theme.war?Web-ContextPath=/base-theme\n' +
				'true\n' +
				'g!'
		}
	];

	function mockSendCommand(commands) {
		var i = 0;

		prototype.sendCommand = function(command) {
			command = arguments.length > 1 ? Array.prototype.slice.call(arguments).join(' ') : command;

			return new Promise(function(resolve, reject) {
				var response = '';

				if (commands) {
					assert.equal(command, commands[i], 'commands are fired in order');

					i++;
				}

				_.some(responseMap, function(item, index) {
					if (command.indexOf(item.command) > -1) {
						response = item.response;

						return true;
					}
				});

				resolve(response);
			});
		};
	}

	after(function() {
		process.chdir(originalCWD);
	});

	before(function() {
		originalCWD = process.cwd();

		process.chdir(path.join(__dirname, '../fixtures/themes/7.0/base-theme'));

		WatchSocket = require('../../lib/watch_socket');
	});

	beforeEach(function() {
		prototype = _.create(WatchSocket.prototype);
	});

	describe('deploy', function() {
		it('should run deploy commands in order', function(done) {
			mockSendCommand([
				'lb -u | grep webbundle:file.*base-theme',
				'stop 474',
				'install webbundledir:file://' + path.join(process.cwd(), '.web_bundle_dir?Web-ContextPath=/base-theme'),
				'start 0'
			]);

			prototype.end = done;
			prototype.webBundleDir = '.web_bundle_dir';

			prototype.deploy();
		});
	});

	describe('undeploy', function() {
		it('should run undeploy commands in order', function(done) {
			mockSendCommand([
				'lb -u | grep webbundledir:file.*base-theme',
				'uninstall 473',
				'lb -u | grep webbundle:file.*base-theme',
				'start 474'
			]);

			prototype.end = done;

			prototype.undeploy();
		});
	});

	describe('_formatWebBundleDirCommand', function() {
		it('should properly format install command based on os platform', function() {
			var sep = path.sep;

			prototype.webBundleDir = '.web_bundle_dir';
			prototype._isWin = function() {
				return false;
			};
			path.sep = '/';

			var command = prototype._formatWebBundleDirCommand();

			assert(/install webbundledir:file:\/\/\/[A-Za-z]/.test(command));
			assert(command.indexOf('/liferay-theme-tasks/test/fixtures/themes/7.0/base-theme/.web_bundle_dir?Web-ContextPath=/base-theme' > -1));

			prototype._isWin = function() {
				return true;
			};
			path.sep = '\\';

			command = prototype._formatWebBundleDirCommand();

			assert(command.indexOf('install webbundledir:file:/' + process.cwd() > -1));
			assert(command.indexOf('/liferay-theme-tasks/test/fixtures/themes/7.0/base-theme/.web_bundle_dir?Web-ContextPath=/base-theme' > -1));

			path.sep = sep;
		});
	});

	describe('_getWebBundleData', function() {
		it('should parse response data and pass it to _getWebBundleDataFromResponse', function(done) {
			mockSendCommand();

			prototype._getWebBundleData(false)
				.then(function(data) {
					assert(!_.isUndefined(data.id));
					assert(!_.isUndefined(data.level));
					assert(!_.isUndefined(data.status));
					assert(!_.isUndefined(data.updateLocation));

					done();
				});
		});
	});

	describe('_getWebBundleDataFromResponse', function() {
		var webBundleResponseData = '456|Resolved   |    1|webbundle:file:/themes/test-theme.war?Web-ContextPath=/test-theme';
		var webBundleDirResponseData = '456|Active     |    1|webbundledir:file:/themes/test-theme.war?Web-ContextPath=/test-theme';

		it('should scrape bundle data from response', function(done) {
			var data = prototype._getWebBundleDataFromResponse(webBundleResponseData, 'webbundle');

			assert.deepEqual(data, {
				id: '456',
				level: '1',
				status: 'Resolved',
				updateLocation: 'webbundle:file:/themes/test-theme.war?Web-ContextPath=/test-theme'
			});

			data = prototype._getWebBundleDataFromResponse(webBundleDirResponseData, 'webbundledir');

			assert.deepEqual(data, {
				id: '456',
				level: '1',
				status: 'Active',
				updateLocation: 'webbundledir:file:/themes/test-theme.war?Web-ContextPath=/test-theme'
			});

			data = prototype._getWebBundleDataFromResponse(webBundleResponseData, 'webbundledir');

			assert.deepEqual(data, {
				status: null
			});

			done();
		});
	});

	describe('_getWebBundleIdFromResponse', function() {
		var responseData = 'install webbundledir:file:///themes/test-theme/.web_bundle_build\n' +
			'  Copying 1 file to /themes/test-theme/.web_bundle_build/WEB-INF/classes\n' +
			'  Copying 1 file to /themes/test-theme/.web_bundle_build/WEB-INF/classes\n' +
			'  Copying 1 file to /themes/test-theme/.web_bundle_build/WEB-INF\n' +
			'Bundle ID: 321\n' +
			'g! ';

		it('should scrape id from webbundledir install response data', function(done) {
			var bundleId = prototype._getWebBundleIdFromResponse(responseData);

			assert.equal(bundleId, '321', 'bundle id is from socket response data');

			bundleId = prototype._getWebBundleIdFromResponse('some error from server');

			assert.equal(bundleId, '0', 'bundle id is 0 since response data is invalid');

			done();
		});
	});

	describe('_installWebBundleDir', function() {
		it('should create valid webbundledir path and pass correct command to gogoShell.sendCommand', function(done) {
			prototype.sendCommand = sinon.spy();
			prototype.webBundleDir = '.web_bundle_dir';

			var command = 'install webbundledir:file://' + path.join(process.cwd(), prototype.webBundleDir);

			prototype._installWebBundleDir();

			assert(prototype.sendCommand.calledWith(command + '?Web-ContextPath=/base-theme'), 'sendCommand called with correct args');
			assert.equal(prototype.sendCommand.callCount, 1, 'sendCommand was only invoked once');

			done();
		});
	});

	describe('_startBundle', function() {
		it('should pass arguments to gogoShell.sendCommand', function(done) {
			prototype.sendCommand = sinon.spy();

			prototype._startBundle('123');

			assert(prototype.sendCommand.calledWith('start', '123'), 'sendCommand called with correct args');
			assert.equal(prototype.sendCommand.callCount, 1, 'sendCommand was only invoked once');

			done();
		});
	});

	describe('_stopBundle', function() {
		it('should pass arguments to gogoShell.sendCommand', function(done) {
			prototype.sendCommand = sinon.spy();

			prototype._stopBundle('123');

			assert(prototype.sendCommand.calledWith('stop', '123'), 'sendCommand called with correct args');
			assert.equal(prototype.sendCommand.callCount, 1, 'sendCommand was only invoked once');

			done();
		});
	});

	describe('_uninstallBundle', function() {
		it('should pass arguments to gogoShell.sendCommand', function(done) {
			prototype.sendCommand = sinon.spy();

			prototype._uninstallBundle('123');

			assert(prototype.sendCommand.calledWith('uninstall', '123'), 'sendCommand called with correct args');
			assert.equal(prototype.sendCommand.callCount, 1, 'sendCommand was only invoked once');

			done();
		});
	});
});
