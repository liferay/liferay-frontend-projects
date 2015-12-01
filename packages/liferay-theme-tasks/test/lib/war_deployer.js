'use strict';

var _ = require('lodash');
var chai = require('chai');
var fs = require('fs-extra');
var os = require('os');
var path = require('path');
var sinon = require('sinon');
var WarDeployer = require('../../lib/war_deployer');

var assert = chai.assert;
var expect = chai.expect;
chai.use(require('chai-fs'));

var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', 'base-theme');

describe('WarDeployer', function() {
	// init
	it('should initialize', function(done) {
		var instance = this;

		var warDeployer = new WarDeployer({
			fileName: 'test'
		});

		assert.equal(warDeployer.host, 'localhost');
		assert.equal(warDeployer.port, '8080');
		assert.equal(warDeployer.protocol, 'http');
		assert.equal(warDeployer.fileName, 'test');
		assert.equal(warDeployer.password, undefined);
		assert.equal(warDeployer.username, undefined);

		done();
	});

	// _getAuth
	it('should get authorization string', function(done) {
		var instance = this;

		var password = Math.random().toString(36);
		var username = Math.random().toString(36);

		var warDeployer = new WarDeployer({
			fileName: 'test',
			password: password,
			username: username
		});

		assert.equal(warDeployer._getAuth(), username + ':' + password);

		done();
	});

	// _getBoundaryKey
	it('should get random boundaryKey only once', function(done) {
		var instance = this;

		var warDeployer = new WarDeployer({
			fileName: 'test'
		});

		var boundaryKey = warDeployer._getBoundaryKey();

		assert.equal(boundaryKey, warDeployer._getBoundaryKey());
		assert.equal(boundaryKey, warDeployer._getBoundaryKey());

		warDeployer.boundaryKey = null;

		assert.notEqual(boundaryKey, warDeployer._getBoundaryKey());

		done();
	});

	// _getFileHeaders
	it('should generate valid file headers', function(done) {
		var instance = this;

		var warDeployer = new WarDeployer({
			fileName: 'test'
		});

		var fileHeaders = warDeployer._getFileHeaders();

		var regex = new RegExp('--' + warDeployer._getBoundaryKey());

		assert(regex.test(fileHeaders));

		regex = new RegExp('Content-Disposition:\\sform-data;\\sname="test";\\sfilename="test.war"');

		assert(regex.test(fileHeaders));

		done();
	});

	// _getPostOptions
	it('should return valid http/https post options', function(done) {
		var instance = this;

		var password = Math.random().toString(36);
		var username = Math.random().toString(36);

		var warDeployer = new WarDeployer({
			fileName: 'test',
			password: password,
			url: 'http://some-host:1234',
			username: username
		});

		var postOptions = warDeployer._getPostOptions();
		var boundaryKey = warDeployer._getBoundaryKey();

		assert.deepEqual(postOptions, {
			auth: username + ':' + password,
			headers: {
				'Content-Type': 'multipart/form-data; boundary="' + boundaryKey + '"'
			},
			host: 'some-host',
			method: 'POST',
			path: '/server-manager-web/plugins',
			port: '1234'
		});

		done();
	});

	// _getQuestion
	it('should return valid inquirer question object', function(done) {
		var instance = this;

		var warDeployer = new WarDeployer({
			fileName: 'test'
		});

		var question = warDeployer._getQuestion('test', 'test message');

		assert.deepEqual(question, {
			default: 'test message',
			message: 'Enter your test for localhost',
			name: 'test',
			type: 'input'
		});

		var question = warDeployer._getQuestion('password', 'test message');

		assert.deepEqual(question, {
			default: 'test message',
			message: 'Enter your password for localhost',
			name: 'password',
			type: 'password'
		});

		done();
	});

	// _makeRequest - TODO

	// _onResponseData
	it('should set deployed property based on response data', function(done) {
		var instance = this;

		var warDeployer = new WarDeployer({
			fileName: 'test'
		});

		expect(warDeployer._onResponseData).to.not.throw(Error);

		assert(!warDeployer.deployed);

		warDeployer._onResponseData('{"status": 0, "error": "there was an error"}');

		assert(!warDeployer.deployed);

		warDeployer._onResponseData('{"status": 0}');

		assert(warDeployer.deployed);

		done();
	});

	// _onResponseEnd
	it('should log appropriate message based on deployed status', function(done) {
		var instance = this;

		var warDeployer = new WarDeployer({
			fileName: 'test'
		});

		var gutil = require('gulp-util');

		gutil.log = sinon.spy();

		warDeployer._onResponseEnd();

		sinon.assert.calledWith(gutil.log, gutil.colors.yellow('Warning:'));

		warDeployer.deployed = true;

		gutil.log = sinon.spy();

		warDeployer._onResponseEnd();

		sinon.assert.calledWith(gutil.log, gutil.colors.cyan('test.war'));

		done();
	});

	// _promptCredentialsIfNeeded
	it('should prompt user if password or username is not specified', function(done) {
		var instance = this;

		var warDeployer = new WarDeployer({
			fileName: 'test',
			password: 'test'
		});

		var inquirer = require('inquirer');

		inquirer.prompt = sinon.spy();

		warDeployer._promptCredentialsIfNeeded();

		sinon.assert.calledWith(inquirer.prompt, [{
			default: 'test@liferay.com',
			message: 'Enter your username for localhost',
			name: 'username',
			type: 'input'
		}]);

		done();
	});

	// _promptCredentialsIfNeeded
	it('should immediately invoke _makeRequest if password and username are specified', function(done) {
		var instance = this;

		var warDeployer = new WarDeployer({
			fileName: 'test',
			username: 'test'
		});

		warDeployer._makeRequest = sinon.spy();

		warDeployer._promptCredentialsIfNeeded();

		sinon.assert.neverCalledWith(warDeployer._makeRequest)

		var warDeployer = new WarDeployer({
			fileName: 'test',
			password: 'test',
			username: 'test'
		});

		warDeployer._makeRequest = sinon.spy();

		warDeployer._promptCredentialsIfNeeded();

		sinon.assert.calledOnce(warDeployer._makeRequest);

		done();
	});

	// _setURLSettings
	it('should parse url option and set host, port, and protocol properties', function(done) {
		var instance = this;

		var warDeployer = new WarDeployer({
			fileName: 'test'
		});

		warDeployer._setURLSettings('https://some-host.com:4321');

		assert.equal(warDeployer.host, 'some-host.com');
		assert.equal(warDeployer.port, 4321);
		assert.equal(warDeployer.protocol, 'https');

		done();
	});

	// _validateOptions
	it('should throw error if fileName is not specified', function(done) {
		var instance = this;

		expect(function() {
			new WarDeployer({});
		}).to.throw('fileName required');

		done();
	});

	// _validateURLSettings
	it('should throw error if protocol does not equal http or https', function(done) {
		var instance = this;

		expect(function() {
			new WarDeployer({
				fileName: 'test',
				url: 'test://localhost:8080'
			});
		}).to.throw('http or https must be used as protocol');

		done();
	});

	// _writeWarFile - TODO
});
