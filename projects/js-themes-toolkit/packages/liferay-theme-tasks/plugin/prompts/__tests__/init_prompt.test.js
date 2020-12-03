/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const _ = require('lodash');
const path = require('path');
const sinon = require('sinon');

const project = require('../../../lib/project');
const InitPrompt = require('../init_prompt');

const savedCwd = process.cwd();

let prototype;

function getDefaultAnswers() {
	return {
		appServerPath: path.join(__dirname, 'fixtures', 'server', 'tomcat'),
		deployPath: path.join(__dirname, 'fixtures', 'server', 'deploy'),
		url: 'http://localhost:8080',
		webappsPath: path.join(
			__dirname,
			'fixtures',
			'server',
			'tomcat',
			'webapps'
		),
	};
}

beforeAll(() => {
	process.chdir(path.join(__dirname, 'fixtures', 'c-project'));
	project._reload();
});

afterAll(() => {
	process.chdir(savedCwd);
});

beforeEach(() => {
	prototype = _.create(InitPrompt.prototype);
});

test('_afterPrompt should store normalized answers', () => {
	const store = (prototype.store = {});

	var defaultAnswers = getDefaultAnswers();

	prototype.done = sinon.spy();

	prototype._afterPrompt(defaultAnswers);

	expect(store.appServerPath).toBe(defaultAnswers.appServerPath);
	expect(store.deployPath).toBe(defaultAnswers.deployPath);
	expect(store.url).toBe(defaultAnswers.url);

	expect(prototype.done.callCount).toBe(1);

	prototype.done = null;

	prototype._afterPrompt(defaultAnswers);
});

test('_deployPathWhen should return false and add deployPath to answers', done => {
	var defaultAnswers = getDefaultAnswers();

	var answers = {
		appServerPath: defaultAnswers.appServerPath,
	};

	prototype.async = function() {
		return function(ask) {
			expect(answers.deployPath).toBe(defaultAnswers.deployPath);
			expect(!ask).toBe(true);

			done();
		};
	};

	prototype._deployPathWhen(answers);
});

test('_deployPathWhen should return true when deploy path is not a sibling with provided appServerPath', done => {
	var defaultAnswers = getDefaultAnswers();

	var answers = {
		appServerPath: path.join(defaultAnswers.appServerPath, '..'),
	};

	prototype.async = function() {
		return function(ask) {
			expect(_.isUndefined(answers.deployPath)).toBe(true);
			expect(ask).toBeTruthy();

			done();
		};
	};

	prototype._deployPathWhen(answers);
});

test('_getDefaultDeployPath should return defualy deploy path value based on answers', () => {
	var defaultPath = prototype._getDefaultDeployPath({
		appServerPath: '/path-to/appserver/tomcat',
	});

	expect(path.join('/path-to', 'appserver', 'deploy')).toBe(defaultPath);
});

test('_prompt should invoke inquirer.prompt with correct args', () => {
	var inquirer = require('inquirer');

	var prompt = inquirer.prompt;

	inquirer.prompt = sinon.spy();

	prototype._prompt({});

	var args = inquirer.prompt.args[0];

	_.forEach(args[0], item => {
		expect(_.isObject(item)).toBe(true);
	});

	expect(_.isFunction(args[1])).toBe(true);

	inquirer.prompt = prompt;
});

test('_validateAppServerPath should properly validate path and return appropriate messages if invalid', () => {
	var defaultAnswers = getDefaultAnswers();

	var retVal = prototype._validateAppServerPath();

	expect(!retVal).toBe(true);

	retVal = prototype._validateAppServerPath('/fake/path');

	expect(retVal).toBe('"/fake/path" does not exist');

	retVal = prototype._validateAppServerPath(__filename);

	expect(/is not a directory/.test(retVal)).toBe(true);

	retVal = prototype._validateAppServerPath(
		path.join(defaultAnswers.appServerPath, '..')
	);

	expect(/doesn't appear to be an app server directory/.test(retVal)).toBe(
		true
	);

	retVal = prototype._validateAppServerPath(
		path.join(__dirname, 'fixtures', 'server', 'glassfish')
	);

	expect(retVal).toBe(true);

	retVal = prototype._validateAppServerPath(
		path.join(__dirname, 'fixtures', 'server', 'jboss')
	);

	expect(retVal).toBe(true);

	retVal = prototype._validateAppServerPath(
		path.join(__dirname, 'fixtures', 'server', 'tomcat')
	);

	expect(retVal).toBe(true);

	retVal = prototype._validateAppServerPath(
		path.join(__dirname, 'fixtures', 'server', 'wildfly')
	);

	expect(retVal).toBe(true);
});
