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

		return this._getBundleId(true)
			.then(function(bundleId) {
				return bundleId ? instance._stopBundle(bundleId) : bundleId;
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

	isWebBundle: function(active) {
		var instance = this;

		return this._getBundleId(active)
			.then(function(webBundleId) {
				return instance.sendCommand('lb -u | grep', webBundleId);
			})
			.then(function(data) {
				return data.indexOf('webbundledir:file:') > -1;
			});
	},

	undeploy: function() {
		var instance = this;

		return this._getBundleId(true)
			.then(function(bundleId) {
				return bundleId ? instance._uninstallBundle(bundleId) : bundleId;
			})
			.then(this._getBundleId.bind(this, false))
			.then(function(bundleId) {
				return bundleId ? instance._startBundle(bundleId) : bundleId;
			})
			.then(function() {
				instance.end();
			});
	},

	_getBundleId: function(active) {
		var themeName = themeConfig.name;

		var regex = this._getThemeIdRegex(themeName, active);

		return this.sendCommand('lb -s | grep ' + themeName)
			.then(function(data) {
				var match = data.match(regex);

				var bundleId = match ? match[1] : 0;

				return bundleId;
			});
	},

	_getThemeIdRegex: function(themeName, active) {
		var state = active ? 'Active' : 'Resolved';

		return RegExp('\\s*?([0-9]+)\\|' + state + '.*' + _.escapeRegExp(themeName));
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
		return this.sendCommand('start ' + bundleId);
	},

	_stopBundle: function(bundleId) {
		return this.sendCommand('stop ' + bundleId);
	},

	_uninstallBundle: function(bundleId) {
		return this.sendCommand('uninstall ' + bundleId);
	}
});

module.exports = WatchSocket;
