'use strict';

var fs = require('fs');

function Script() {}

Script.prototype = {
    constructor: Script,

    load: function () {
        try {
            var content = fs.readFileSync(this.src, 'utf-8');

            eval(content);

            this.onload();

        } catch (error) {
            if (this.onerror) {
                this.onerror(error);
            }
        }
    }
};

var document = {
    head: {
        appendChild: function (script) {
            process.nextTick(function () {
                script.load();
            });
        },

        removeChild: function () {
            // Empty
        }
    },

    createElement: function (name) {
        return new Script();
    }

};

global.document = document;
global.Script = Script;