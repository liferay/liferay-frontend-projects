'use strict';

var _ = require('lodash');
var path = require('path');
var test = require('ava');

var themeFinder = require('../../index');

test.cb('find should return an object when searching for global modules', function(t) {
	themeFinder.find(function(themeResults) {
		t.true(_.isObject(themeResults));

		t.end();
	});
});

test.cb('find should return an object when searching for npm modules', function(t) {
	themeFinder.find({
		globalModules: false,
		themelet: true
	}, function(themeResults) {
		_.forEach(themeResults, function(item, index) {
			t.true(_.isObject(item));
			t.true(_.isObject(item.liferayTheme), 'liferayTheme object is present');
			t.true(item.keywords.indexOf('liferay-theme') > -1, 'package has liferay-theme keyword');
		});

		t.true(_.isObject(themeResults));

		t.end();
	});
});
