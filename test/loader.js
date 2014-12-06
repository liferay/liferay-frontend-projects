'use strict';

var assert = require('assert');
require('./fixture/common.js');

var config = require('./fixture/config.js');

describe('Loader', function () {
    it('', function () {
        var configParser = new global.ConfigParser();

        Loader.define({
            name: 'pej-jung',
            dependencies: [],
            path: 'aui-pej-jung'
        });
    });
});