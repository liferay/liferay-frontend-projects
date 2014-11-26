(function (global, factory) {
    'use strict';

    var built = factory();

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    global.LoaderUtils.EventEmitter = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function () {
    'use strict';

    function EventEmitter() {
        this._events = {};
    }

    EventEmitter.prototype = {
        constructor: EventEmitter,

        on: function (event, callback) {
            var listeners = this._events[event] = this._events[event] || [];

            listeners.push(callback);
        },

        off: function (event, callback) {
            var listeners = this._events[event];

            if (listeners) {
                var callbackIndex = listeners.indexOf(callback);

                if (callbackIndex > -1) {
                    listeners.splice(callbackIndex, 1);
                } else {
                    console.warn('Off: callback was not removed: ' + callback.toString());
                }
            } else {
                console.warn('Off: there are no listeners for event: ' + event);
            }
        },

        emit: function (event) {
            var listeners = this._events[event];

            if (listeners) {
                for (var i = 0; i < listeners.length; i++) {
                    var listener = listeners[i];

                    listener.call(listener);
                }
            } else {
                console.warn('No listeners for event: ' + event);
            }
        }
    };

    return EventEmitter;
}));