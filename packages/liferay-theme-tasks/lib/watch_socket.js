'use strict';

var _ = require('lodash');
var async = require('async');
var net = require('net');
var path = require('path');
var GogoShell = require('gogo-shell');

var lfrThemeConfig = require('./liferay_theme_config');

var themeConfig = lfrThemeConfig.getConfig(true);

var WatchSocket = function(config) {
	GogoShell.call(this, config);

	config = config || {};

	this.webBundleDir = config.webBundleDir || '.web_bundle_build';
};

WatchSocket.prototype = _.create(GogoShell.prototype, {
	deploy: function() {
		var instance = this;

		return this._getWebBundleData(false)
			.then(function(data) {
				return data.id ? instance._stopBundle(data.id) : data;
			})
			.then(this._installWebBundleDir.bind(this))
			.then(function(data) {
				var webBundleId = instance._getWebBundleIdFromResponse(data);

				return instance._startBundle(webBundleId);
			})
			.then(function() {
				instance.end();
			});
	},

	undeploy: function() {
		var instance = this;

		return this._getWebBundleData(true)
			.then(function(data) {
				return data.id ? instance._uninstallBundle(data.id) : data;
			})
			.then(this._getWebBundleData.bind(this, false))
			.then(function(data) {
				return data.id ? instance._startBundle(data.id) : data;
			})
			.then(function() {
				instance.end();
			});
	},

	_getWebBundleData: function(webBundleDir) {
		var instance = this;

		var webBundleDirType = webBundleDir ? 'webbundledir' : 'webbundle';

		var themeName = themeConfig.name;

		var grepRegex = webBundleDirType + ':file.*' + themeName;

		return this.sendCommand('lb -u | grep', grepRegex)
			.then(function(data) {
				var lines = data.split('\n');

				var result = lines[1];

				return instance._getWebBundleDataFromResponse(result, webBundleDirType);
			});
	},

	_getWebBundleDataFromResponse: function(response, webBundleDirType) {
		var data = {
			status: null
		};

		if (response.indexOf(webBundleDirType + ':file') > -1) {
			var fields = response.split('|');

			data = {
				id: _.trim(fields[0]),
				level: _.trim(fields[2]),
				status: _.trim(fields[1]),
				updateLocation: _.trim(fields[3])
			};
		}

		return data;
	},

	_getWebBundleIdFromResponse: function(response) {
		var match = response.match(/Bundle\sID:\s*([0-9]+)/);

		return match ? match[1] : 0;
	},

	_installWebBundleDir: function() {
		var buildPath = path.join(process.cwd(), this.webBundleDir);

		return this.sendCommand('install webbundledir:file://' + buildPath);
	},

	_startBundle: function(bundleId) {
		return this.sendCommand('start', bundleId);
	},

	_stopBundle: function(bundleId) {
		return this.sendCommand('stop', bundleId);
	},

	_uninstallBundle: function(bundleId) {
		return this.sendCommand('uninstall', bundleId);
	}
});

module.exports = WatchSocket;
