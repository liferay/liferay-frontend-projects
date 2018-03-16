'use strict';

let _ = require('lodash');
let EventEmitter = require('events').EventEmitter;
let fs = require('fs');
let gutil = require('gulp-util');
let inquirer = require('inquirer');
let path = require('path');
let url = require('url');

let CWD = process.cwd();

let colors = gutil.colors;

let WarDeployer = function(options) {
	this.init(options);
};

WarDeployer.prototype = _.create(EventEmitter.prototype, {
	init: function(options) {
		EventEmitter.call(this);

		this._validateOptions(options);

		let siteURL = options.url || 'http://localhost:8080';

		this._setURLSettings(siteURL);

		this._validateURLSettings();

		this.fileName = options.fileName;
		this.password = options.password;
		this.username = options.username;
	},

	deploy: function() {
		this._promptCredentialsIfNeeded();
	},

	_getAuth: function() {
		return this.username + ':' + this.password;
	},

	_getBoundaryKey: function() {
		let boundaryKey = this.boundaryKey;

		if (!boundaryKey) {
			boundaryKey = Math.random().toString(16);

			this.boundaryKey = boundaryKey;
		}

		return boundaryKey;
	},

	_getFileHeaders: function() {
		let fileName = this.fileName;

		return (
			'--' +
			this._getBoundaryKey() +
			'\r\n' +
			'Content-Type: application/x-zip\r\n' +
			'Content-Disposition: form-data; name="' +
			fileName +
			'"; filename="' +
			fileName +
			'.war"\r\n' +
			'Content-Transfer-Encoding: binary\r\n\r\n'
		);
	},

	_getPostOptions: function() {
		return {
			auth: this._getAuth(),
			headers: {
				'Content-Type':
					'multipart/form-data; boundary="' +
					this._getBoundaryKey() +
					'"',
			},
			host: this.host,
			method: 'POST',
			path: '/server-manager-web/plugins',
			port: this.port,
		};
	},

	_getQuestion: function(name, defaultValue) {
		return {
			default: defaultValue,
			message: 'Enter your ' + name + ' for ' + this.host,
			name: name,
			type: name === 'password' ? name : 'input',
		};
	},

	_makeRequest: function() {
		let instance = this;

		let protocol = require(this.protocol);

		let req = protocol.request(this._getPostOptions(), function(res) {
			res.setEncoding('utf8');

			res.on('data', function(chunk) {
				instance._onResponseData(chunk);
			});

			res.on('end', function() {
				instance._onResponseEnd();
			});
		});

		req.on('error', function(err) {
			if (err) {
				throw err;
			}
		});

		this._writeWarFile(req);
	},

	_onResponseData: function(chunk) {
		try {
			let responseData = JSON.parse(chunk);

			if (responseData && !responseData.error) {
				this.deployed = true;
			}
		} catch (err) {}
	},

	_onResponseEnd: function() {
		if (this.deployed) {
			gutil.log(
				colors.cyan(this.fileName + '.war'),
				'successfully deployed to',
				this.host
			);
		} else {
			gutil.log(
				colors.yellow('Warning:'),
				'There was a problem deploying',
				colors.cyan(this.fileName + '.war'),
				'to',
				this.host
			);
		}
	},

	_promptCredentialsIfNeeded: function() {
		let instance = this;

		let questions = [];

		if (!this.username) {
			questions.push(this._getQuestion('username', 'test@liferay.com'));
		}

		if (!this.password) {
			questions.push(this._getQuestion('password', 'test'));
		}

		if (questions.length) {
			inquirer.prompt(questions, function(answers) {
				Object.keys(answers).forEach(function(key) {
					instance[key] = answers[key];
				});

				instance._makeRequest();
			});
		} else {
			instance._makeRequest();
		}
	},

	_setURLSettings: function(siteURL) {
		let parsedURL = url.parse(siteURL);

		this.host = parsedURL.hostname;
		this.port = parsedURL.port;
		this.protocol = _.trimRight(parsedURL.protocol, ':');
	},

	_validateOptions: function(options) {
		if (!options.fileName) {
			throw new Error('fileName required');
		}
	},

	_validateURLSettings: function() {
		if (['http', 'https'].indexOf(this.protocol) < 0) {
			throw new Error('http or https must be used as protocol');
		}
	},

	_writeWarFile: function(req) {
		let instance = this;

		let boundaryKey = this._getBoundaryKey();

		req.write(this._getFileHeaders(this._fileName, boundaryKey));

		fs
			.createReadStream(path.join(CWD, 'dist', this.fileName + '.war'))
			.on('end', function() {
				req.end('\r\n--' + boundaryKey + '--');

				instance.emit('end');
			})
			.pipe(req, {
				end: false,
			});
	},
});

module.exports = WarDeployer;
