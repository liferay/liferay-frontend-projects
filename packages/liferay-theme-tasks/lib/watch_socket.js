'use strict';

let _ = require('lodash');
let del = require('del');
let GogoShell = require('gogo-shell');
let os = require('os');
let path = require('path');

let lfrThemeConfig = require('./liferay_theme_config');

let themeConfig = lfrThemeConfig.getConfig(true);

let REGEX_WIN = /^win/;

let WatchSocket = function(config) {
	GogoShell.call(this, config);

	config = config || {};

	this.webBundleDir = config.webBundleDir || '.web_bundle_build';
};

WatchSocket.prototype = _.create(GogoShell.prototype, {
	deploy: function() {
		let instance = this;

		return this._getWebBundleData(false)
			.then(function(data) {
				return data.id ? instance._uninstallBundle(data.id) : data;
			})
			.then(this._installWebBundleDir.bind(this))
			.then(function(data) {
				let webBundleId = instance._getWebBundleIdFromResponse(data);

				return instance._startBundle(webBundleId);
			})
			.then(function() {
				instance.end();
			});
	},

	uninstall: function(warPath, distName) {
		let delPath = del.sync(warPath, {
			dryRun: true,
			force: true,
		});

		if (!delPath.length) {
			return;
		}

		del.sync(warPath, {
			force: true,
		});

		return this._waitForUninstall(distName);
	},

	_formatWebBundleDirCommand: function(themePath) {
		let buildPath = path.join(themePath, this.webBundleDir);

		buildPath = buildPath.split(path.sep).join('/');

		if (!this._isWin()) {
			buildPath = '/' + buildPath;
		}

		buildPath = buildPath.replace(/\s/g, '%20');

		let themeName = themeConfig.name;

		return (
			'install webbundledir:file:/' +
			buildPath +
			'?Web-ContextPath=/' +
			themeName
		);
	},

	_getWebBundleData: function(webBundleDir) {
		let instance = this;

		let webBundleDirType = webBundleDir ? 'webbundledir' : 'webbundle';

		let themeName = themeConfig.name;

		let grepRegex = webBundleDirType + ':file.*' + themeName;

		return this.sendCommand('lb -u | grep', grepRegex).then(function(data) {
			let lines = data.split('\n');

			let result = lines[1];

			return instance._getWebBundleDataFromResponse(
				result,
				webBundleDirType
			);
		});
	},

	_getWebBundleDataFromResponse: function(response, webBundleDirType) {
		let data = {
			status: null,
		};

		if (response.indexOf(webBundleDirType + ':file') > -1) {
			let fields = response.split('|');

			data = {
				id: _.trim(fields[0]),
				level: _.trim(fields[2]),
				status: _.trim(fields[1]),
				updateLocation: _.trim(fields[3]),
			};
		}

		return data;
	},

	_getWebBundleIdFromResponse: function(response) {
		let match = response.match(/Bundle\sID:\s*([0-9]+)/);

		return match ? match[1] : 0;
	},

	_installWebBundleDir: function() {
		return this.sendCommand(this._formatWebBundleDirCommand(process.cwd()));
	},

	_isWin: function() {
		return REGEX_WIN.test(os.platform());
	},

	_startBundle: function(bundleId) {
		return this.sendCommand('start', bundleId);
	},

	_stopBundle: function(bundleId) {
		return this.sendCommand('stop', bundleId);
	},

	_uninstallBundle: function(bundleId) {
		return this.sendCommand('uninstall', bundleId);
	},

	_waitForUninstall: function(distName) {
		let instance = this;

		return this.sendCommand('lb ' + distName)
			.delay(200)
			.then(function(data) {
				if (data.indexOf('No matching bundles found') < 0) {
					return instance._waitForUninstall(distName);
				}

				return;
			});
	},
});

module.exports = WatchSocket;
