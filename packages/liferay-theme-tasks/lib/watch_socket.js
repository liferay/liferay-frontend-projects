const _ = require('lodash');
const del = require('del');
const GogoShell = require('gogo-shell');
const os = require('os');
const path = require('path');

const lfrThemeConfig = require('./liferay_theme_config');
const themeUtil = require('./util');

const themeConfig = lfrThemeConfig.getConfig(true);

const REGEX_WIN = /^win/;

class WatchSocket extends GogoShell {
	constructor(config) {
		super(config);

		config = config || {};

		this.webBundleDir = config.webBundleDir || '.web_bundle_build';
		this.deploymentStrategy = config.deploymentStrategy;
		this.dockerContainerName = config.dockerContainerName;
		this.dockerThemePath = config.dockerThemePath;
	}

	deploy() {
		return this._getWebBundleData()
			.then(data => {
				return data.id ? this._uninstallBundle(data.id) : data;
			})
			.then(this._installWebBundleDir.bind(this))
			.then(data => {
				const webBundleId = this._getWebBundleIdFromResponse(data);

				return this._startBundle(webBundleId);
			})
			.then(() => {
				this.end();
			});
	}

	uninstall(warPath, distName) {
		if (this._isDocker()) {
			const delPath = themeUtil
				.dockerExec(this.dockerContainerName, 'ls ' + warPath)
				.stdout.toString();

			if (!delPath.length) {
				return;
			}

			themeUtil.dockerExec(this.dockerContainerName, 'rm -rf ' + warPath);
		} else {
			const delPath = del.sync(warPath, {
				dryRun: true,
				force: true,
			});

			if (!delPath.length) {
				return;
			}

			del.sync(warPath, {
				force: true,
			});
		}

		return this._waitForUninstall(distName);
	}

	_formatWebBundleDirCommand(themePath) {
		let buildPath = path.join(themePath, this.webBundleDir);

		buildPath = buildPath.split(path.sep).join('/');

		if (!this._isWin() || this._isDocker()) {
			buildPath = '/' + buildPath;
		}

		buildPath = buildPath.replace(/\s/g, '%20');

		const themeName = themeConfig.name;

		return (
			'install \'webbundledir:file:/' +
			buildPath +
			'?Web-ContextPath=/' +
			themeName +
			'\''
		);
	}

	_getWebBundleData() {
		const themeName = themeConfig.name;

		const grepRegex = '\'webbundle(dir|):file.*' + themeName + '\'';

		return this.sendCommand('lb -u | grep ' + grepRegex).then(data => {
			const lines = data.split('\n');

			const result = lines[1];

			return this._getWebBundleDataFromResponse(result);
		});
	}

	_getWebBundleDataFromResponse(response) {
		let data = {
			status: null,
		};

		if (!response) {
			return data;
		}

		let i = response.indexOf('webbundle:file');

		if (i == -1) {
			i = response.indexOf('webbundledir:file');
		}

		if (i > -1) {
			const fields = response.split('|');

			data = {
				id: _.trim(fields[0]),
				level: _.trim(fields[2]),
				status: _.trim(fields[1]),
				updateLocation: _.trim(fields[3]),
			};
		}

		return data;
	}

	_getWebBundleIdFromResponse(response) {
		const match = response.match(/Bundle\sID:\s*([0-9]+)/);

		return match ? match[1] : 0;
	}

	_installWebBundleDir() {
		return this.sendCommand(
			this._formatWebBundleDirCommand(
				this._isDocker() ? this.dockerThemePath : process.cwd()
			)
		);
	}

	_isWin() {
		return REGEX_WIN.test(os.platform());
	}

	_isDocker() {
		return this.deploymentStrategy === 'DockerContainer';
	}

	_startBundle(bundleId) {
		return this.sendCommand('start', bundleId);
	}

	_stopBundle(bundleId) {
		return this.sendCommand('stop', bundleId);
	}

	_uninstallBundle(bundleId) {
		return this.sendCommand('uninstall', bundleId);
	}

	_waitForUninstall(distName) {
		return this.sendCommand('lb ' + distName)
			.delay(200)
			.then(data => {
				if (data.indexOf('No matching bundles found') < 0) {
					return this._waitForUninstall(distName);
				}
			});
	}
}

module.exports = WatchSocket;
