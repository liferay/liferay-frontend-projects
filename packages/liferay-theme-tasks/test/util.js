'use strict';

var _ = require('lodash');
var assert = require('chai').assert;
var sinon = require('sinon');

module.exports.assertBoundFunction = function(prototype, methodName, stub) {
	prototype[methodName] = sinon.spy();

	return function(fn) {
		fn('argument');

		assert(prototype[methodName].calledOnce);
		assert(prototype[methodName].calledWith('argument'));
	};
};

var PrototypeMethodSpy = function() {
	this.methods = [];
};

PrototypeMethodSpy.prototype.add = function(parent, methodName, stub) {
	if (!parent[methodName]) {
		throw new Error(methodName + ' is not a method of ' + parent.name);
	}

	this.methods.push({
		method: parent[methodName],
		methodName: methodName,
		parent: parent
	});

	if (stub) {
		parent[methodName] = sinon.stub();
	}
	else {
		parent[methodName] = sinon.spy();
	}

	return parent[methodName];
};

PrototypeMethodSpy.prototype.flush = function() {
	_.forEach(this.methods, function(item, index) {
		item.parent[item.methodName] = item.method;
	});

	this.methods = [];
};

module.exports.PrototypeMethodSpy = PrototypeMethodSpy;
