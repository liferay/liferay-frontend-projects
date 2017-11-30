'use strict';

let _ = require('lodash');
let path = require('path');

let depModuleName = 'liferay-theme-deps-7.0';

function isSassPartial(name) {
	return _.startsWith(path.basename(name), '_');
}

module.exports = {depModuleName, isSassPartial};
