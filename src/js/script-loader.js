'use strict';

var Promise = require('ypromise');

function ScriptLoader() {
    this._loadedModules = [];
}

ScriptLoader.prototype = {
    constructor: ScriptLoader,

    import: function(modules) {
        return new Promise(function(resolve, reject) {
            var scriptElement = document.createElement('script');

            scriptElement.src
        });
    }
};