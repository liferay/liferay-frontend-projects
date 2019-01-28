const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const colors = require('ansi-colors');
const fs = require('fs');
const inquirer = require('inquirer');
const log = require('fancy-log');
const path = require('path');
const url = require('url');

const CWD = process.cwd();

class WarDeployer extends EventEmitter {
	constructor(options) {
		super();
		this.init(options);
	}

	init(options) {
		EventEmitter.call(this);

		this._validateOptions(options);

		let siteURL = options.url || 'http://localhost:8080';

		this._setURLSettings(siteURL);

		this._validateURLSettings();

		this.fileName = options.fileName;
		this.password = options.password;
		this.username = options.username;
	}

	deploy() {
		this._promptCredentialsIfNeeded();
	}

	_getAuth() {
		return this.username + ':' + this.password;
	}

	_getBoundaryKey() {
		let boundaryKey = this.boundaryKey;

		if (!boundaryKey) {
			boundaryKey = Math.random().toString(16);

			this.boundaryKey = boundaryKey;
		}

		return boundaryKey;
	}

	_getFileHeaders() {
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
	}

	_getPostOptions() {
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
	}

	_getQuestion(name, defaultValue) {
		return {
			default: defaultValue,
			message: 'Enter your ' + name + ' for ' + this.host,
			name: name,
			type: name === 'password' ? name : 'input',
		};
	}

	_makeRequest() {
		let protocol = require(this.protocol);

		let req = protocol.request(this._getPostOptions(), function(res) {
			res.setEncoding('utf8');

			res.on('data', function(chunk) {
				this._onResponseData(chunk);
			});

			res.on('end', function() {
				this._onResponseEnd();
			});
		});

		req.on('error', function(err) {
			if (err) {
				throw err;
			}
		});

		this._writeWarFile(req);
	}

	_onResponseData(chunk) {
		try {
			let responseData = JSON.parse(chunk);

			if (responseData && !responseData.error) {
				this.deployed = true;
			}
		} catch (err) {}
	}

	_onResponseEnd() {
		if (this.deployed) {
			log(
				colors.cyan(this.fileName + '.war'),
				'successfully deployed to',
				this.host
			);
		} else {
			log(
				colors.yellow('Warning:'),
				'There was a problem deploying',
				colors.cyan(this.fileName + '.war'),
				'to',
				this.host
			);
		}
	}

	_promptCredentialsIfNeeded() {
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
					this[key] = answers[key];
				});

				this._makeRequest();
			});
		} else {
			this._makeRequest();
		}
	}

	_setURLSettings(siteURL) {
		let parsedURL = url.parse(siteURL);

		this.host = parsedURL.hostname;
		this.port = parsedURL.port;
		this.protocol = _.trimEnd(parsedURL.protocol, ':');
	}

	_validateOptions(options) {
		if (!options.fileName) {
			throw new Error('fileName required');
		}
	}

	_validateURLSettings() {
		if (['http', 'https'].indexOf(this.protocol) < 0) {
			throw new Error('http or https must be used as protocol');
		}
	}

	_writeWarFile(req) {
		let boundaryKey = this._getBoundaryKey();

		req.write(this._getFileHeaders(this._fileName, boundaryKey));

		fs.createReadStream(path.join(CWD, 'dist', this.fileName + '.war'))
			.on('end', function() {
				req.end('\r\n--' + boundaryKey + '--');

				this.emit('end');
			})
			.pipe(
				req,
				{
					end: false,
				}
			);
	}
}

module.exports = WarDeployer;
