const _ = require('lodash');
const assert = require('assert');
const del = require('del');
const path = require('path');
const Promise = require('bluebird');
const sinon = require('sinon');

const testUtil = require('../../test/util');

const initCwd = process.cwd();
const responseMap = [
	{
		command: 'lb -u | grep \'webbundle(dir|):file.*base-theme\'',
		response:
			'lb -u | grep \'webbundle(dir|):file.*base-theme\'\n' +
			'  474|Resolved   |    1|webbundle:file:///Users/rframpton/Projects/Portal/CE/trunk/osgi/configs/march-2-theme.war?Web-ContextPath=/base-theme\n' +
			'true\n' +
			'g!',
	},
];

let prototype;
let WatchSocket;

beforeEach(() => {
	testUtil.copyTempTheme({
		namespace: 'watch_socket',
	});

	WatchSocket = require('../../lib/watch_socket');
	prototype = _.create(WatchSocket.prototype);
});

afterEach(() => {
	testUtil.cleanTempTheme('base-theme', '7.0', 'watch_socket', initCwd);
});

it('deploy should run deploy commands in order', done => {
	let folderPath = path.join(
		process.cwd(),
		'.web_bundle_dir?Web-ContextPath=/base-theme'
	);

	folderPath = folderPath.split(path.sep).join('/');

	if (!prototype._isWin()) {
		folderPath = '/' + folderPath;
	}

	mockSendCommand([
		'lb -u | grep webbundle:file.*base-theme',
		'stop 474',
		'install webbundledir:file:/' + folderPath,
		'start 0',
	]);

	prototype.end = done;
	prototype.webBundleDir = '.web_bundle_dir';

	prototype.deploy();
});

it('uninstall only waits for uninstall if war file existed', () => {
	sinon.stub(del, 'sync');
	del.sync.returns([]);
	prototype._waitForUninstall = sinon.spy();

	prototype.uninstall('path/to/my-theme.war', 'my-theme');

	expect(del.sync.calledOnce).toBe(true);
	expect(prototype._waitForUninstall.notCalled).toBe(true);

	del.sync.reset();

	del.sync.returns(['path/to/my-theme.war']);

	prototype.uninstall('path/to/my-theme.war', 'my-theme');

	expect(del.sync.calledTwice).toBe(true);
	expect(prototype._waitForUninstall.calledOnce).toBe(true);
	expect(prototype._waitForUninstall.calledWith('my-theme')).toBe(true);

	del.sync.restore();
});

it('_formatWebBundleDirCommand should properly format install command based on os platform', () => {
	prototype.webBundleDir = '.web_bundle_dir';

	const rootDir = prototype._isWin() ? 'c:/Users' : '/Users';

	const themePath = path.join(rootDir, 'themes', 'base-theme');

	const command = prototype._formatWebBundleDirCommand(themePath);

	if (!prototype._isWin()) {
		expect(command).toEqual(
			'install \'webbundledir:file:///Users/themes/base-theme/.web_bundle_dir?Web-ContextPath=/base-theme\''
		);
	} else {
		expect(command).toEqual(
			'install \'webbundledir:file:/c:/Users/themes/base-theme/.web_bundle_dir?Web-ContextPath=/base-theme\''
		);
	}
});

it('_getWebBundleData should parse response data and pass it to _getWebBundleDataFromResponse', done => {
	mockSendCommand();

	prototype._getWebBundleData(false).then(data => {
		expect(!_.isUndefined(data.id)).toBe(true);
		expect(!_.isUndefined(data.level)).toBe(true);
		expect(!_.isUndefined(data.status)).toBe(true);
		expect(!_.isUndefined(data.updateLocation)).toBe(true);

		done();
	});
});

it('_getWebBundleDataFromResponse should scrape bundle data from response', () => {
	const webBundleResponseData =
		'456|Resolved   |    1|webbundle:file:/themes/test-theme.war?Web-ContextPath=/test-theme';
	const webBundleDirResponseData =
		'456|Active     |    1|webbundledir:file:/themes/test-theme.war?Web-ContextPath=/test-theme';

	let data = prototype._getWebBundleDataFromResponse(webBundleResponseData);

	expect(data).toEqual({
		id: '456',
		level: '1',
		status: 'Resolved',
		updateLocation:
			'webbundle:file:/themes/test-theme.war?Web-ContextPath=/test-theme',
	});

	data = prototype._getWebBundleDataFromResponse(webBundleDirResponseData);

	expect(data).toEqual({
		id: '456',
		level: '1',
		status: 'Active',
		updateLocation:
			'webbundledir:file:/themes/test-theme.war?Web-ContextPath=/test-theme',
	});

	data = prototype._getWebBundleDataFromResponse('');

	expect(data).toEqual({
		status: null,
	});
});

it('_getWebBundleIdFromResponse should scrape id from webbundledir install response data', () => {
	const responseData =
		'install webbundledir:file:///themes/test-theme/.web_bundle_build\n' +
		'  Copying 1 file to /themes/test-theme/.web_bundle_build/WEB-INF/classes\n' +
		'  Copying 1 file to /themes/test-theme/.web_bundle_build/WEB-INF/classes\n' +
		'  Copying 1 file to /themes/test-theme/.web_bundle_build/WEB-INF\n' +
		'Bundle ID: 321\n' +
		'g! ';

	let bundleId = prototype._getWebBundleIdFromResponse(responseData);

	expect(bundleId).toBe('321');

	bundleId = prototype._getWebBundleIdFromResponse('some error from server');

	expect(bundleId).toBe(0);
});

it('_installWebBundleDir should create valid webbundledir path and pass correct command to gogoShell.sendCommand', () => {
	prototype.sendCommand = sinon.spy();
	prototype.webBundleDir = '.web_bundle_dir';

	const command = prototype._formatWebBundleDirCommand(process.cwd());

	prototype._installWebBundleDir();

	expect(prototype.sendCommand.calledWith(command)).toBe(true);
	expect(prototype.sendCommand.callCount).toBe(1);
});

it('_startBundle should pass arguments to gogoShell.sendCommand', () => {
	prototype.sendCommand = sinon.spy();

	prototype._startBundle('123');

	expect(prototype.sendCommand.calledWith('start', '123')).toBe(true);
	expect(prototype.sendCommand.callCount).toBe(1);
});

it('_stopBundle should pass arguments to gogoShell.sendCommand', () => {
	prototype.sendCommand = sinon.spy();

	prototype._stopBundle('123');

	expect(prototype.sendCommand.calledWith('stop', '123')).toBe(true);
	expect(prototype.sendCommand.callCount).toBe(1);
});

it('_uninstallBundle should pass arguments to gogoShell.sendCommand', () => {
	prototype.sendCommand = sinon.spy();

	prototype._uninstallBundle('123');

	expect(prototype.sendCommand.calledWith('uninstall', '123')).toBe(true);
	expect(prototype.sendCommand.callCount).toBe(1);
});

it('_waitForUninstall should recursively check if module has been uninstalled', done => {
	let i = 0;
	let response = '';

	prototype.sendCommand = function(command) {
		i++;

		expect(command).toBe('lb my-theme');

		return new Promise(function(resolve, reject) {
			if (i > 2) {
				response = 'No matching bundles found';
			}

			resolve(response);
		});
	};

	prototype._waitForUninstall('my-theme').then(function(data) {
		expect(i).toBe(3);

		done();
	});
});

function mockSendCommand(commands) {
	let i = 0;

	prototype.sendCommand = function(command) {
		command =
			arguments.length > 1
				? Array.prototype.slice.call(arguments).join(' ')
				: command;

		return new Promise(function(resolve, reject) {
			let response = '';

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
