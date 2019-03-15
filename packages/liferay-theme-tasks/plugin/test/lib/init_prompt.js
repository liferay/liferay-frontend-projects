/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

var _ = require('lodash');
var path = require('path');
var sinon = require('sinon');

var initCwd = process.cwd();
var InitPrompt;
var prototype;

function getDefaultAnswers() {
	return {
		appServerPath: path.join(__dirname, '../fixtures/server/tomcat'),
		deployPath: path.join(__dirname, '../fixtures/server/deploy'),
		url: 'http://localhost:8080',
		webappsPath: path.join(__dirname, '../fixtures/server/tomcat/webapps'),
	};
}

beforeAll(function() {
	process.chdir(path.join(__dirname, '../..'));

	InitPrompt = require('../../lib/init_prompt');
});

afterAll(function() {
	process.chdir(initCwd);
});

beforeEach(function() {
	prototype = _.create(InitPrompt.prototype);
});

test('_afterPrompt should store normalized answers', function() {
	prototype.store = {
		store: sinon.spy(),
	};

	var defaultAnswers = getDefaultAnswers();

	prototype.done = sinon.spy();

	prototype._afterPrompt(defaultAnswers);

	var storeArgs = prototype.store.store.args[0][0];

	expect(storeArgs.appServerPath).toBe(defaultAnswers.appServerPath);
	expect(storeArgs.deployPath).toBe(defaultAnswers.deployPath);
	expect(storeArgs.url).toBe(defaultAnswers.url);

	expect(!_.isUndefined(storeArgs.appServerPathPlugin)).toBe(true);
	expect(!_.isUndefined(storeArgs.deployed)).toBe(true);
	expect(!_.isUndefined(storeArgs.pluginName)).toBe(true);

	expect(prototype.done.callCount).toBe(1);

	prototype.done = null;

	prototype._afterPrompt(defaultAnswers);
});

test('_deployPathWhen should return false and add deployPath to answers', function(done) {
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

test('_deployPathWhen should return true when deploy path is not a sibling with provided appServerPath', function(done) {
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

test('_getDefaultDeployPath should return defualy deploy path value based on answers', function() {
	var defaultPath = prototype._getDefaultDeployPath({
		appServerPath: '/path-to/appserver/tomcat',
	});

	expect(path.join('/path-to', 'appserver', 'deploy')).toBe(defaultPath);
});

test('_normalizeAnswers should normalize prompt answers', function() {
	var defaultAnswers = getDefaultAnswers();
	var answers = getDefaultAnswers();

	prototype._normalizeAnswers(answers);

	expect(answers.appServerPath).toBe(defaultAnswers.appServerPath);
	expect(answers.deployPath).toBe(defaultAnswers.deployPath);
	expect(answers.url).toBe(defaultAnswers.url);

	expect(answers.pluginName).toBe('plugin');
	expect(answers.deployed).toBe(false);
	expect(answers.appServerPathPlugin).toBe(
		path.join(defaultAnswers.appServerPath, 'webapps/plugin')
	);

	answers = _.assign({}, defaultAnswers);

	answers.appServerPath = defaultAnswers.webappsPath;

	prototype._normalizeAnswers(answers);

	expect(answers.appServerPathPlugin).toBe(
		path.join(defaultAnswers.appServerPath, 'webapps/plugin')
	);
});

test('_prompt should invoke inquirer.prompt with correct args', function() {
	var inquirer = require('inquirer');

	var prompt = inquirer.prompt;

	inquirer.prompt = sinon.spy();

	prototype._prompt({});

	var args = inquirer.prompt.args[0];

	_.forEach(args[0], function(item) {
		expect(_.isObject(item)).toBe(true);
	});

	expect(_.isFunction(args[1])).toBe(true);

	inquirer.prompt = prompt;
});

test('_validateAppServerPath should properly validate path and return appropriate messages if invalid', function() {
	var defaultAnswers = getDefaultAnswers();

	var retVal = prototype._validateAppServerPath();

	expect(!retVal).toBe(true);

	retVal = prototype._validateAppServerPath('/fake/path');

	expect(retVal).toBe('"/fake/path" does not exist');

	retVal = prototype._validateAppServerPath(
		path.join(__dirname, 'init_prompt.js')
	);

	expect(/is not a directory/.test(retVal)).toBe(true);

	retVal = prototype._validateAppServerPath(
		path.join(defaultAnswers.appServerPath, '..')
	);

	expect(/doesn't appear to be an app server directory/.test(retVal)).toBe(
		true
	);

	retVal = prototype._validateAppServerPath(
		path.join(__dirname, '../fixtures/server/glassfish')
	);

	expect(retVal).toBe(true);

	retVal = prototype._validateAppServerPath(
		path.join(__dirname, '../fixtures/server/jboss')
	);

	expect(retVal).toBe(true);

	retVal = prototype._validateAppServerPath(
		path.join(__dirname, '../fixtures/server/tomcat')
	);

	expect(retVal).toBe(true);

	retVal = prototype._validateAppServerPath(
		path.join(__dirname, '../fixtures/server/wildfly')
	);

	expect(retVal).toBe(true);
});
