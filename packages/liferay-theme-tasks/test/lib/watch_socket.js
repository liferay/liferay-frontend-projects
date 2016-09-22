'use strict';

var _ = require('lodash');
var assert = require('assert');
var del = require('del');
var path = require('path');
var Promise = require('bluebird');
var sinon = require('sinon');
var test = require('ava');

var testUtil = require('../util');

var initCwd = process.cwd();
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
				assert(command, commands[i], 'commands are fired in order');

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

test.cb.before(function(t) {
	testUtil.copyTempTheme({
		namespace: 'watch_socket'
	}, function(config) {
		WatchSocket = require('../../lib/watch_socket');

		t.end();
	});
});

test.after(function() {
	process.chdir(initCwd);
});

test.beforeEach(function() {
	prototype = _.create(WatchSocket.prototype);
});

test.cb('deploy should run deploy commands in order', function(t) {
	var folderPath = path.join(process.cwd(), '.web_bundle_dir?Web-ContextPath=/base-theme');

	folderPath = folderPath.split(path.sep).join('/');

	if (!prototype._isWin()) {
		folderPath = '/' + folderPath;
	}

	mockSendCommand([
		'lb -u | grep webbundle:file.*base-theme',
		'stop 474',
		'install webbundledir:file:/' + folderPath,
		'start 0'
	]);

	prototype.end = t.end;
	prototype.webBundleDir = '.web_bundle_dir';

	prototype.deploy();
});

test('uninstall only waits for uninstall if war file existed', function(t) {
	sinon.stub(del, 'sync');
	del.sync.returns([]);
	prototype._waitForUninstall = sinon.spy();

	prototype.uninstall('path/to/my-theme.war', 'my-theme');

	t.true(del.sync.calledOnce);
	t.true(prototype._waitForUninstall.notCalled);

	del.sync.reset();

	del.sync.returns(['path/to/my-theme.war']);

	prototype.uninstall('path/to/my-theme.war', 'my-theme');

	t.true(del.sync.calledTwice);
	t.true(prototype._waitForUninstall.calledOnce);
	t.true(prototype._waitForUninstall.calledWith('my-theme'));

	del.sync.restore();
});

test('_formatWebBundleDirCommand should properly format install command based on os platform', function(t) {
	prototype.webBundleDir = '.web_bundle_dir';

	var rootDir = prototype._isWin() ? 'c:/Users' : '/Users';

	var themePath = path.join(rootDir, 'themes', 'base-theme');

	var command = prototype._formatWebBundleDirCommand(themePath);

	if (!prototype._isWin()) {
		t.is(command, 'install webbundledir:file:///Users/themes/base-theme/.web_bundle_dir?Web-ContextPath=/base-theme');
	}
	else {
		t.is(command, 'install webbundledir:file:/c:/Users/themes/base-theme/.web_bundle_dir?Web-ContextPath=/base-theme');
	}
});

test.cb('_getWebBundleData should parse response data and pass it to _getWebBundleDataFromResponse', function(t) {
	mockSendCommand();

	prototype._getWebBundleData(false)
		.then(function(data) {
			t.true(!_.isUndefined(data.id));
			t.true(!_.isUndefined(data.level));
			t.true(!_.isUndefined(data.status));
			t.true(!_.isUndefined(data.updateLocation));

			t.end();
		});
});

var webBundleResponseData = '456|Resolved   |    1|webbundle:file:/themes/test-theme.war?Web-ContextPath=/test-theme';
var webBundleDirResponseData = '456|Active     |    1|webbundledir:file:/themes/test-theme.war?Web-ContextPath=/test-theme';

test('_getWebBundleDataFromResponse should scrape bundle data from response', function(t) {
	var data = prototype._getWebBundleDataFromResponse(webBundleResponseData, 'webbundle');

	t.deepEqual(data, {
		id: '456',
		level: '1',
		status: 'Resolved',
		updateLocation: 'webbundle:file:/themes/test-theme.war?Web-ContextPath=/test-theme'
	});

	data = prototype._getWebBundleDataFromResponse(webBundleDirResponseData, 'webbundledir');

	t.deepEqual(data, {
		id: '456',
		level: '1',
		status: 'Active',
		updateLocation: 'webbundledir:file:/themes/test-theme.war?Web-ContextPath=/test-theme'
	});

	data = prototype._getWebBundleDataFromResponse(webBundleResponseData, 'webbundledir');

	t.deepEqual(data, {
		status: null
	});
});

var responseData = 'install webbundledir:file:///themes/test-theme/.web_bundle_build\n' +
	'  Copying 1 file to /themes/test-theme/.web_bundle_build/WEB-INF/classes\n' +
	'  Copying 1 file to /themes/test-theme/.web_bundle_build/WEB-INF/classes\n' +
	'  Copying 1 file to /themes/test-theme/.web_bundle_build/WEB-INF\n' +
	'Bundle ID: 321\n' +
	'g! ';

test('_getWebBundleIdFromResponse should scrape id from webbundledir install response data', function(t) {
	var bundleId = prototype._getWebBundleIdFromResponse(responseData);

	t.is(bundleId, '321', 'bundle id is from socket response data');

	bundleId = prototype._getWebBundleIdFromResponse('some error from server');

	t.is(bundleId, 0, 'bundle id is 0 since response data is invalid');
});

test('_installWebBundleDir should create valid webbundledir path and pass correct command to gogoShell.sendCommand', function(t) {
	prototype.sendCommand = sinon.spy();
	prototype.webBundleDir = '.web_bundle_dir';

	var command = prototype._formatWebBundleDirCommand(process.cwd());

	prototype._installWebBundleDir();

	t.true(prototype.sendCommand.calledWith(command), 'sendCommand called with correct args');
	t.is(prototype.sendCommand.callCount, 1, 'sendCommand was only invoked once');
});

test('_startBundle should pass arguments to gogoShell.sendCommand', function(t) {
	prototype.sendCommand = sinon.spy();

	prototype._startBundle('123');

	t.true(prototype.sendCommand.calledWith('start', '123'), 'sendCommand called with correct args');
	t.is(prototype.sendCommand.callCount, 1, 'sendCommand was only invoked once');
});

test('_stopBundle should pass arguments to gogoShell.sendCommand', function(t) {
	prototype.sendCommand = sinon.spy();

	prototype._stopBundle('123');

	t.true(prototype.sendCommand.calledWith('stop', '123'), 'sendCommand called with correct args');
	t.is(prototype.sendCommand.callCount, 1, 'sendCommand was only invoked once');
});

test('_uninstallBundle should pass arguments to gogoShell.sendCommand', function(t) {
	prototype.sendCommand = sinon.spy();

	prototype._uninstallBundle('123');

	t.true(prototype.sendCommand.calledWith('uninstall', '123'), 'sendCommand called with correct args');
	t.is(prototype.sendCommand.callCount, 1, 'sendCommand was only invoked once');
});

test.cb('_waitForUninstall should recursively check if module has been uninstalled', function(t) {
	var i = 0;
	var response = '';

	prototype.sendCommand = function(command) {
		i++;

		t.is(command, 'lb my-theme');

		return new Promise(function(resolve, reject) {
			if (i > 2) {
				response = 'No matching bundles found';
			}

			resolve(response);
		});
	}

	prototype._waitForUninstall('my-theme')
		.then(function(data) {
			t.is(i, 3);

			t.end();
		});
});
