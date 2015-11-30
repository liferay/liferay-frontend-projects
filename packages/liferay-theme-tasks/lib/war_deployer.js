var _ = require('lodash');
var EventEmitter = require('events');
var fs = require('fs');
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var path = require('path');
var url = require('url');
var util = require('util');

var CWD = process.cwd();

var colors = gutil.colors;

var WarDeployer = function(options) {
	this.init(options);
};

WarDeployer.prototype = _.create(EventEmitter.prototype, {
	init: function(options) {
		EventEmitter.call(this);

		this._validateOptions(options);

		var siteURL = options.url || 'http://localhost:8080';

		this._setURLSettings(siteURL);

		this._validateURLSettings();

		this.fileName = options.fileName;
		this.password = options.password;
		this.username = options.username;

		this._promptCredentialsIfNeeded(options);
	},

	_getAuth: function() {
		return this.username + ':' + this.password;
	},

	_getBoundaryKey: function() {
		var boundaryKey = this.boundaryKey;

		if (!boundaryKey) {
			boundaryKey = Math.random().toString(16);

			this.boundaryKey = boundaryKey;
		}

		return boundaryKey;
	},

	_getFileHeaders: function() {
		var fileName = this.fileName

		return '--' + this._getBoundaryKey() + '\r\n' +
		'Content-Type: application/x-zip\r\n' +
		'Content-Disposition: form-data; name="' + fileName + '"; filename="' + fileName + '.war"\r\n' +
		'Content-Transfer-Encoding: binary\r\n\r\n'
	},

	_getPostOptions: function() {
		return {
			auth: this._getAuth(),
			host: this.host,
			headers: {
				'Content-Type': 'multipart/form-data; boundary="' + this._getBoundaryKey() + '"'
			},
			method: 'POST',
			path: '/server-manager-web/plugins',
			port: this.port
		};
	},

	_getQuestion: function(name, defaultValue) {
		return {
			default: defaultValue,
			message: 'Enter your ' + name + ' for ' + this.host,
			name: name,
			type: name == 'password' ? name : 'input'
		};
	},

	_makeRequest: function() {
		var instance = this;

		var protocol = require(this.protocol);

		var req = protocol.request(this._getPostOptions(), function(res) {
			res.setEncoding('utf8');

			res.on('data', function(chunk) {
				instance._onResponseData(chunk);
			});

			res.on('end', function() {
				instance._onResponseEnd();
			});
		});

		req.on('error', function(err) {
			if (err) throw err;
		});

		this._writeWarFile(req);
	},

	_onResponseData: function(chunk) {
		try {
			var responseData = JSON.parse(chunk);

			if (responseData && !responseData.error) {
				this.deployed = true;
			}
		}
		catch (e) {
		}
	},

	_onResponseEnd: function() {
		if (!this.deployed) {
			gutil.log(colors.yellow('Warning:'), 'There was a problem deploying', colors.cyan(this.fileName + '.war'), 'to', this.host);
		}
		else {
			gutil.log(colors.cyan(this.fileName + '.war'), 'successfully deployed to', this.host);
		}
	},

	_promptCredentialsIfNeeded: function() {
		var instance = this;

		var questions = [];

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
		}
		else {
			instance._makeRequest();
		}
	},

	_setURLSettings: function(siteURL) {
		var parsedURL = url.parse(siteURL);

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
		var instance = this;

		var boundaryKey = this._getBoundaryKey();

		req.write(this._getFileHeaders(this._fileName, boundaryKey));

		fs.createReadStream(path.join(CWD, 'dist', this.fileName + '.war'))
			.on('end', function() {
				req.end('\r\n--' + boundaryKey + '--');

				instance.emit('end');
			})
			.pipe(req, {
				end: false
			});
	}
});

module.exports = WarDeployer;
