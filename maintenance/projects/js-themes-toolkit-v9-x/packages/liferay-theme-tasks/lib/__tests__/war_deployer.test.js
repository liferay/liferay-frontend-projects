/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const sinon = require('sinon');

const WarDeployer = require('../war_deployer');

it('init should initialize', () => {
	const warDeployer = new WarDeployer({
		fileName: 'test',
	});

	expect(warDeployer.host).toEqual('localhost');
	expect(warDeployer.port).toEqual('8080');
	expect(warDeployer.protocol).toEqual('http');
	expect(warDeployer.fileName).toEqual('test');
	expect(warDeployer).toHaveProperty('password', undefined);
	expect(warDeployer).toHaveProperty('username', undefined);
});

it('_getAuth should get authorization string', () => {
	const password = Math.random().toString(36);
	const username = Math.random().toString(36);

	const warDeployer = new WarDeployer({
		fileName: 'test',
		password,
		username,
	});

	expect(warDeployer._getAuth()).toEqual(username + ':' + password);
});

it('_getBoundaryKey should get random boundaryKey only once', () => {
	const warDeployer = new WarDeployer({
		fileName: 'test',
	});

	const boundaryKey = warDeployer._getBoundaryKey();

	expect(boundaryKey).toEqual(warDeployer._getBoundaryKey());
	expect(boundaryKey).toEqual(warDeployer._getBoundaryKey());

	warDeployer.boundaryKey = null;

	expect(boundaryKey).not.toEqual(warDeployer._getBoundaryKey());
});

it('_getFileHeaders should generate valid file headers', () => {
	const warDeployer = new WarDeployer({
		fileName: 'test',
	});

	const fileHeaders = warDeployer._getFileHeaders();

	let regex = new RegExp('--' + warDeployer._getBoundaryKey());

	expect(regex.test(fileHeaders)).toBeTruthy();

	regex = new RegExp(
		'Content-Disposition:\\sform-data;\\sname="test";\\sfilename="test.war"'
	);

	expect(regex.test(fileHeaders)).toBeTruthy();
});

it('_getPostOptions should return valid http/https post options', () => {
	const password = Math.random().toString(36);
	const username = Math.random().toString(36);

	const warDeployer = new WarDeployer({
		fileName: 'test',
		password,
		url: 'http://some-host:1234',
		username,
	});

	const postOptions = warDeployer._getPostOptions();
	const boundaryKey = warDeployer._getBoundaryKey();

	expect(postOptions).toEqual({
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

it('_getQuestion should return valid inquirer question object', () => {
	const warDeployer = new WarDeployer({
		fileName: 'test',
	});

	let question = warDeployer._getQuestion('test', 'test message');

	expect(question).toEqual({
		default: 'test message',
		message: 'Enter your test for localhost',
		name: 'test',
		type: 'input',
	});

	question = warDeployer._getQuestion('password', 'test message');

	expect(question).toEqual({
		default: 'test message',
		message: 'Enter your password for localhost',
		name: 'password',
		type: 'password',
	});
});

it('_onResponseData should set deployed property based on response data', () => {
	const warDeployer = new WarDeployer({
		fileName: 'test',
	});

	expect(() => warDeployer._onResponseData()).not.toThrow();

	expect(!warDeployer.deployed).toBe(true);

	warDeployer._onResponseData('{"status": 0, "error": "there was an error"}');

	expect(!warDeployer.deployed).toBe(true);

	warDeployer._onResponseData('{"status": 0}');

	expect(warDeployer.deployed).toBe(true);
});

/*

TODO FIND A BETTER WAY TO TEST THIS

it('_onResponseEnd should log appropriate message based on deployed status', () => {
	t.plan(0);

	let warDeployer = new WarDeployer({
		fileName: 'test',
	});

	let log = require('fancy-log');
	let colors = require('ansi-colors');

	log = sinon.spy();

	warDeployer._onResponseEnd();

	sinon.assert.calledWith(log, colors.yellow('Warning:'));

	warDeployer.deployed = true;

	log = sinon.spy();

	warDeployer._onResponseEnd();

	sinon.assert.calledWith(log, colors.cyan('test.war'));
});
*/

it('_promptCredentialsIfNeeded should prompt user if password or username is not specified', () => {
	const warDeployer = new WarDeployer({
		fileName: 'test',
		password: 'test',
	});

	const inquirer = require('inquirer');

	inquirer.prompt = sinon.spy();

	warDeployer._promptCredentialsIfNeeded();

	expect(
		inquirer.prompt.calledWith([
			{
				default: 'test@liferay.com',
				message: 'Enter your username for localhost',
				name: 'username',
				type: 'input',
			},
		])
	).toBe(true);
});

it('_promptCredentialsIfNeeded should immediately invoke _makeRequest if password and username are specified', () => {
	let warDeployer = new WarDeployer({
		fileName: 'test',
		username: 'test',
	});

	warDeployer._makeRequest = sinon.spy();

	warDeployer._promptCredentialsIfNeeded();

	expect(warDeployer._makeRequest.neverCalledWith()).toBe(true);

	warDeployer = new WarDeployer({
		fileName: 'test',
		password: 'test',
		username: 'test',
	});

	warDeployer._makeRequest = sinon.spy();

	warDeployer._promptCredentialsIfNeeded();

	expect(warDeployer._makeRequest.calledOnce).toBe(true);
});

it('_setURLSettings should parse url option and set host, port, and protocol properties', () => {
	const warDeployer = new WarDeployer({
		fileName: 'test',
	});

	warDeployer._setURLSettings('https://some-host.com:4321');

	expect(warDeployer.host).toEqual('some-host.com');
	expect(warDeployer.port).toEqual('4321');
	expect(warDeployer.protocol).toEqual('https');
});

it('_validateOptions should throw error if fileName is not specified', () => {
	expect(() => new WarDeployer({})).toThrow();
});

it('_validateURLSettings should throw error if protocol does not equal http or https', () => {
	expect(
		() =>
			new WarDeployer({
				fileName: 'test',
				url: 'test://localhost:8080',
			})
	).toThrow();
});
