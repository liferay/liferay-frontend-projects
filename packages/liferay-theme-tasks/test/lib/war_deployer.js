'use strict';

let sinon = require('sinon');
let test = require('ava');

let WarDeployer = require('../../lib/war_deployer');

test('init should initialize', function(t) {
	let warDeployer = new WarDeployer({
		fileName: 'test',
	});

	t.is(warDeployer.host, 'localhost');
	t.is(warDeployer.port, '8080');
	t.is(warDeployer.protocol, 'http');
	t.is(warDeployer.fileName, 'test');
	t.is(warDeployer.password, undefined);
	t.is(warDeployer.username, undefined);
});

test('_getAuth should get authorization string', function(t) {
	let password = Math.random().toString(36);
	let username = Math.random().toString(36);

	let warDeployer = new WarDeployer({
		fileName: 'test',
		password: password,
		username: username,
	});

	t.is(warDeployer._getAuth(), username + ':' + password);
});

test('_getBoundaryKey should get random boundaryKey only once', function(t) {
	let warDeployer = new WarDeployer({
		fileName: 'test',
	});

	let boundaryKey = warDeployer._getBoundaryKey();

	t.is(boundaryKey, warDeployer._getBoundaryKey());
	t.is(boundaryKey, warDeployer._getBoundaryKey());

	warDeployer.boundaryKey = null;

	t.not(boundaryKey, warDeployer._getBoundaryKey());
});

test('_getFileHeaders should generate valid file headers', function(t) {
	let warDeployer = new WarDeployer({
		fileName: 'test',
	});

	let fileHeaders = warDeployer._getFileHeaders();

	let regex = new RegExp('--' + warDeployer._getBoundaryKey());

	t.true(regex.test(fileHeaders));

	regex = new RegExp(
		'Content-Disposition:\\sform-data;\\sname="test";\\sfilename="test.war"'
	);

	t.true(regex.test(fileHeaders));
});

test('_getPostOptions should return valid http/https post options', function(
	t
) {
	let password = Math.random().toString(36);
	let username = Math.random().toString(36);

	let warDeployer = new WarDeployer({
		fileName: 'test',
		password: password,
		url: 'http://some-host:1234',
		username: username,
	});

	let postOptions = warDeployer._getPostOptions();
	let boundaryKey = warDeployer._getBoundaryKey();

	t.deepEqual(postOptions, {
		auth: username + ':' + password,
		headers: {
			'Content-Type':
				'multipart/form-data; boundary="' + boundaryKey + '"',
		},
		host: 'some-host',
		method: 'POST',
		path: '/server-manager-web/plugins',
		port: '1234',
	});
});

test('_getQuestion should return valid inquirer question object', function(t) {
	let warDeployer = new WarDeployer({
		fileName: 'test',
	});

	var question = warDeployer._getQuestion('test', 'test message');

	t.deepEqual(question, {
		default: 'test message',
		message: 'Enter your test for localhost',
		name: 'test',
		type: 'input',
	});

	var question = warDeployer._getQuestion('password', 'test message');

	t.deepEqual(question, {
		default: 'test message',
		message: 'Enter your password for localhost',
		name: 'password',
		type: 'password',
	});
});

test('_onResponseData should set deployed property based on response data', function(
	t
) {
	let warDeployer = new WarDeployer({
		fileName: 'test',
	});

	t.notThrows(warDeployer._onResponseData);

	t.true(!warDeployer.deployed);

	warDeployer._onResponseData('{"status": 0, "error": "there was an error"}');

	t.true(!warDeployer.deployed);

	warDeployer._onResponseData('{"status": 0}');

	t.true(warDeployer.deployed);
});

test('_onResponseEnd should log appropriate message based on deployed status', function(
	t
) {
	t.plan(0);

	let warDeployer = new WarDeployer({
		fileName: 'test',
	});

	let gutil = require('gulp-util');

	gutil.log = sinon.spy();

	warDeployer._onResponseEnd();

	sinon.assert.calledWith(gutil.log, gutil.colors.yellow('Warning:'));

	warDeployer.deployed = true;

	gutil.log = sinon.spy();

	warDeployer._onResponseEnd();

	sinon.assert.calledWith(gutil.log, gutil.colors.cyan('test.war'));
});

test('_promptCredentialsIfNeeded should prompt user if password or username is not specified', function(
	t
) {
	t.plan(0);

	let warDeployer = new WarDeployer({
		fileName: 'test',
		password: 'test',
	});

	let inquirer = require('inquirer');

	inquirer.prompt = sinon.spy();

	warDeployer._promptCredentialsIfNeeded();

	sinon.assert.calledWith(inquirer.prompt, [
		{
			default: 'test@liferay.com',
			message: 'Enter your username for localhost',
			name: 'username',
			type: 'input',
		},
	]);
});

test('_promptCredentialsIfNeeded should immediately invoke _makeRequest if password and username are specified', function(
	t
) {
	t.plan(0);

	var warDeployer = new WarDeployer({
		fileName: 'test',
		username: 'test',
	});

	warDeployer._makeRequest = sinon.spy();

	warDeployer._promptCredentialsIfNeeded();

	sinon.assert.neverCalledWith(warDeployer._makeRequest);

	var warDeployer = new WarDeployer({
		fileName: 'test',
		password: 'test',
		username: 'test',
	});

	warDeployer._makeRequest = sinon.spy();

	warDeployer._promptCredentialsIfNeeded();

	sinon.assert.calledOnce(warDeployer._makeRequest);
});

test('_setURLSettings should parse url option and set host, port, and protocol properties', function(
	t
) {
	let warDeployer = new WarDeployer({
		fileName: 'test',
	});

	warDeployer._setURLSettings('https://some-host.com:4321');

	t.is(warDeployer.host, 'some-host.com');
	t.is(warDeployer.port, '4321');
	t.is(warDeployer.protocol, 'https');
});

test('_validateOptions should throw error if fileName is not specified', function(
	t
) {
	t.throws(function() {
		new WarDeployer({});
	});
});

test('_validateURLSettings should throw error if protocol does not equal http or https', function(
	t
) {
	t.throws(function() {
		new WarDeployer({
			fileName: 'test',
			url: 'test://localhost:8080',
		});
	});
});
