/*!
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

/*jslint expr: true */
/*global define */

(function (global, factory) {
    var built = factory(); /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    } /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }
    global.PromisePolyfill = built;
    global.Promise || (global.Promise = built);
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function () {

    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    function assign(obj, props) {
        for (var prop in props) { /* istanbul ignore else */
            if (props.hasOwnProperty(prop)) {
                obj[prop] = props[prop];
            }
        }
    }

    /**
     A promise represents a value that may not yet be available. Promises allow
     you to chain asynchronous operations, write synchronous looking code and
     handle errors throughout the process.
     
     This constructor takes a function as a parameter where you can insert the logic
     that fulfills or rejects this promise. The fulfillment value and the rejection
     reason can be any JavaScript value. It's encouraged that rejection reasons be
     error objects
     
     <pre><code>
     var fulfilled = new Promise(function (resolve) {
     resolve('I am a fulfilled promise');
     });
     
     var rejected = new Promise(function (resolve, reject) {
     reject(new Error('I am a rejected promise'));
     });
     </code></pre>
     
     @class Promise
     @constructor
     @param {Function} fn A function where to insert the logic that resolves this
     promise. Receives `resolve` and `reject` functions as parameters.
     This function is called synchronously.
     **/

    function Promise(fn) {
        if (!(this instanceof Promise)) {
            Promise._log('Promises should always be created with new Promise(). This will throw an error in the future', 'error');
            return new Promise(fn);
        }

        var resolver = new Promise.Resolver(this);

        /**
         A reference to the resolver object that handles this promise
         
         @property _resolver
         @type Object
         @private
         */
        this._resolver = resolver;

        try {
            fn(function (value) {
                resolver.resolve(value);
            }, function (reason) {
                resolver.reject(reason);
            });
        } catch (e) {
            resolver.reject(e);
        }
    }

    assign(Promise.prototype, {
        /**
         Schedule execution of a callback to either or both of "fulfill" and
         "reject" resolutions for this promise. The callbacks are wrapped in a new
         promise and that promise is returned.  This allows operation chaining ala
         `functionA().then(functionB).then(functionC)` where `functionA` returns
         a promise, and `functionB` and `functionC` _may_ return promises.
         
         Asynchronicity of the callbacks is guaranteed.
         
         @method then
         @param {Function} [callback] function to execute if the promise
         resolves successfully
         @param {Function} [errback] function to execute if the promise
         resolves unsuccessfully
         @return {Promise} A promise wrapping the resolution of either "resolve" or
         "reject" callback
         **/
        then: function (callback, errback) {
            // using this.constructor allows for customized promises to be
            // returned instead of plain ones
            var resolve, reject, promise = new this.constructor(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            this._resolver._addCallbacks(
            typeof callback === 'function' ? Promise._makeCallback(promise, resolve, reject, callback) : resolve, typeof errback === 'function' ? Promise._makeCallback(promise, resolve, reject, errback) : reject);

            return promise;
        },

/*
        A shorthand for `promise.then(undefined, callback)`.

        Returns a new promise and the error callback gets the same treatment as in
        `then`: errors get caught and turned into rejections, and the return value
        of the callback becomes the fulfilled value of the returned promise.

        @method catch
        @param [Function] errback Callback to be called in case this promise is
                            rejected
        @return {Promise} A new promise modified by the behavior of the error
                            callback
        */
        'catch': function (errback) {
            return this.then(undefined, errback);
        }
    });

    /**
     Wraps the callback in another function to catch exceptions and turn them
     into rejections.
     
     @method _makeCallback
     @param {Promise} promise Promise that will be affected by this callback
     @param {Function} fn Callback to wrap
     @return {Function}
     @static
     @private
     **/
    Promise._makeCallback = function (promise, resolve, reject, fn) {
        // callbacks and errbacks only get one argument
        return function (valueOrReason) {
            var result;

            // Promises model exception handling through callbacks
            // making both synchronous and asynchronous errors behave
            // the same way
            try {
                // Use the argument coming in to the callback/errback from the
                // resolution of the parent promise.
                // The function must be called as a normal function, with no
                // special value for |this|, as per Promises A+
                result = fn(valueOrReason);
            } catch (e) {
                // calling return only to stop here
                reject(e);
                return;
            }

            if (result === promise) {
                reject(new TypeError('Cannot resolve a promise with itself'));
                return;
            }

            resolve(result);
        };
    };

    /**
     Logs a message. This method is designed to be overwritten with  YUI's `log`
     function.
     
     @method _log
     @param {String} msg Message to log
     @param {String} type Log level. One of 'error', 'warn', 'info'.
     @static
     @private
     **/
    Promise._log = function (msg, type) { /* istanbul ignore else */
        if (typeof console !== 'undefined') {
            console[type](msg);
        }
    };

/*
    Ensures that a certain value is a promise. If it is not a promise, it wraps it
    in one.

    This method can be copied or inherited in subclasses. In that case it will
    check that the value passed to it is an instance of the correct class.
    This means that `PromiseSubclass.resolve()` will always return instances of
    `PromiseSubclass`.

    @method resolve
    @param {Any} Any object that may or may not be a promise
    @return {Promise}
    @static
    */
    Promise.resolve = function (value) {
        if (value && value.constructor === this) {
            return value;
        } /*jshint newcap: false */
        return new this(function (resolve) { /*jshint newcap: true */
            resolve(value);
        });
    };

/*
    A shorthand for creating a rejected promise.

    @method reject
    @param {Any} reason Reason for the rejection of this promise. Usually an Error
        Object
    @return {Promise} A rejected promise
    @static
    */
    Promise.reject = function (reason) { /*jshint newcap: false */
        var promise = new this(function () {}); /*jshint newcap: true */

        // Do not go through resolver.reject() because an immediately rejected promise
        // always has no callbacks which would trigger an unnecessary warning
        promise._resolver._result = reason;
        promise._resolver._status = 'rejected';

        return promise;
    };

/*
    Returns a promise that is resolved or rejected when all values are resolved or
    any is rejected. This is useful for waiting for the resolution of multiple
    promises, such as reading multiple files in Node.js or making multiple XHR
    requests in the browser.

    @method all
    @param {Any[]} values An array of any kind of values, promises or not. If a value is not
    @return [Promise] A promise for an array of all the fulfillment values
    @static
    */
    Promise.all = function (values) {
        var Promise = this;
        return new Promise(function (resolve, reject) {
            if (!isArray(values)) {
                reject(new TypeError('Promise.all expects an array of values or promises'));
                return;
            }

            var remaining = values.length,
                i = 0,
                length = values.length,
                results = [];

            function oneDone(index) {
                return function (value) {
                    results[index] = value;

                    remaining--;

                    if (!remaining) {
                        resolve(results);
                    }
                };
            }

            if (length < 1) {
                return resolve(results);
            }

            for (; i < length; i++) {
                Promise.resolve(values[i]).then(oneDone(i), reject);
            }
        });
    };

/*
    Returns a promise that is resolved or rejected when any of values is either
    resolved or rejected. Can be used for providing early feedback in the UI
    while other operations are still pending.

    @method race
    @param {Any[]} values An array of values or promises
    @return {Promise}
    @static
    */
    Promise.race = function (values) {
        var Promise = this;
        return new Promise(function (resolve, reject) {
            if (!isArray(values)) {
                reject(new TypeError('Promise.race expects an array of values or promises'));
                return;
            }

            // just go through the list and resolve and reject at the first change
            // This abuses the fact that calling resolve/reject multiple times
            // doesn't change the state of the returned promise
            for (var i = 0, count = values.length; i < count; i++) {
                Promise.resolve(values[i]).then(resolve, reject);
            }
        });
    };

    /**
     Forces a function to be run asynchronously, but as fast as possible. In Node.js
     this is achieved using `setImmediate` or `process.nextTick`. In YUI this is
     replaced with `Y.soon`.
     
     @method async
     @param {Function} callback The function to call asynchronously
     @static
     **/
    /* istanbul ignore next */
    Promise.async = typeof setImmediate !== 'undefined' ?
    function (fn) {
        setImmediate(fn);
    } : typeof process !== 'undefined' && process.nextTick ? process.nextTick : function (fn) {
        setTimeout(fn, 0);
    };

    /**
     Represents an asynchronous operation. Provides a
     standard API for subscribing to the moment that the operation completes either
     successfully (`fulfill()`) or unsuccessfully (`reject()`).
     
     @class Promise.Resolver
     @constructor
     @param {Promise} promise The promise instance this resolver will be handling
     **/

    function Resolver(promise) {
        /**
         List of success callbacks
         
         @property _callbacks
         @type Array
         @private
         **/
        this._callbacks = [];

        /**
         List of failure callbacks
         
         @property _errbacks
         @type Array
         @private
         **/
        this._errbacks = [];

        /**
         The promise for this Resolver.
         
         @property promise
         @type Promise
         @deprecated
         **/
        this.promise = promise;

        /**
         The status of the operation. This property may take only one of the following
         values: 'pending', 'fulfilled' or 'rejected'.
         
         @property _status
         @type String
         @default 'pending'
         @private
         **/
        this._status = 'pending';

        /**
         This value that this promise represents.
         
         @property _result
         @type Any
         @private
         **/
        this._result = null;
    }

    assign(Resolver.prototype, {
        /**
         Resolves the promise, signaling successful completion of the
         represented operation. All "onFulfilled" subscriptions are executed and passed
         the value provided to this method. After calling `fulfill()`, `reject()` and
         `notify()` are disabled.
         
         @method fulfill
         @param {Any} value Value to pass along to the "onFulfilled" subscribers
         **/
        fulfill: function (value) {
            var status = this._status;

            if (status === 'pending' || status === 'accepted') {
                this._result = value;
                this._status = 'fulfilled';
            }

            if (this._status === 'fulfilled') {
                this._notify(this._callbacks, this._result);

                // Reset the callback list so that future calls to fulfill()
                // won't call the same callbacks again. Promises keep a list
                // of callbacks, they're not the same as events. In practice,
                // calls to fulfill() after the first one should not be made by
                // the user but by then()
                this._callbacks = [];

                // Once a promise gets fulfilled it can't be rejected, so
                // there is no point in keeping the list. Remove it to help
                // garbage collection
                this._errbacks = null;
            }
        },

        /**
         Resolves the promise, signaling *un*successful completion of the
         represented operation. All "onRejected" subscriptions are executed with
         the value provided to this method. After calling `reject()`, `resolve()`
         and `notify()` are disabled.
         
         @method reject
         @param {Any} reason Value to pass along to the "reject" subscribers
         **/
        reject: function (reason) {
            var status = this._status;

            if (status === 'pending' || status === 'accepted') {
                this._result = reason;
                this._status = 'rejected';
                if (!this._errbacks.length) {
                    Promise._log('Promise rejected but no error handlers were registered to it', 'info');
                }
            }

            if (this._status === 'rejected') {
                this._notify(this._errbacks, this._result);

                // See fulfill()
                this._callbacks = null;
                this._errbacks = [];
            }
        },

/*
        Given a certain value A passed as a parameter, this method resolves the
        promise to the value A.

        If A is a promise, `resolve` will cause the resolver to adopt the state of A
        and once A is resolved, it will resolve the resolver's promise as well.
        This behavior "flattens" A by calling `then` recursively and essentially
        disallows promises-for-promises.

        This is the default algorithm used when using the function passed as the
        first argument to the promise initialization function. This means that
        the following code returns a promise for the value 'hello world':

            var promise1 = new Promise(function (resolve) {
                resolve('hello world');
            });
            var promise2 = new Promise(function (resolve) {
                resolve(promise1);
            });
            promise2.then(function (value) {
                assert(value === 'hello world'); // true
            });

        @method resolve
        @param [Any] value A regular JS value or a promise
        */
        resolve: function (value) {
            if (this._status === 'pending') {
                this._status = 'accepted';
                this._value = value;

                if ((this._callbacks && this._callbacks.length) || (this._errbacks && this._errbacks.length)) {
                    this._unwrap(this._value);
                }
            }
        },

        /**
         If `value` is a promise or a thenable, it will be unwrapped by
         recursively calling its `then` method. If not, the resolver will be
         fulfilled with `value`.
         
         This method is called when the promise's `then` method is called and
         not in `resolve` to allow for lazy promises to be accepted and not
         resolved immediately.
         
         @method _unwrap
         @param {Any} value A promise, thenable or regular value
         @private
         **/
        _unwrap: function (value) {
            var self = this,
                unwrapped = false,
                then;

            if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
                self.fulfill(value);
                return;
            }

            try {
                then = value.then;

                if (typeof then === 'function') {
                    then.call(value, function (value) {
                        if (!unwrapped) {
                            unwrapped = true;
                            self._unwrap(value);
                        }
                    }, function (reason) {
                        if (!unwrapped) {
                            unwrapped = true;
                            self.reject(reason);
                        }
                    });
                } else {
                    self.fulfill(value);
                }
            } catch (e) {
                if (!unwrapped) {
                    self.reject(e);
                }
            }
        },

        /**
         Schedule execution of a callback to either or both of "resolve" and
         "reject" resolutions of this resolver. If the resolver is not pending,
         the correct callback gets called automatically.
         
         @method _addCallbacks
         @param {Function} [callback] function to execute if the Resolver
         resolves successfully
         @param {Function} [errback] function to execute if the Resolver
         resolves unsuccessfully
         **/
        _addCallbacks: function (callback, errback) {
            var callbackList = this._callbacks,
                errbackList = this._errbacks;

            // Because the callback and errback are represented by a Resolver, it
            // must be fulfilled or rejected to propagate through the then() chain.
            // The same logic applies to resolve() and reject() for fulfillment.
            if (callbackList) {
                callbackList.push(callback);
            }
            if (errbackList) {
                errbackList.push(errback);
            }

            switch (this._status) {
            case 'accepted':
                this._unwrap(this._value);
                break;
            case 'fulfilled':
                this.fulfill(this._result);
                break;
            case 'rejected':
                this.reject(this._result);
                break;
            }
        },

        /**
         Executes an array of callbacks from a specified context, passing a set of
         arguments.
         
         @method _notify
         @param {Function[]} subs The array of subscriber callbacks
         @param {Any} result Value to pass the callbacks
         @protected
         **/
        _notify: function (subs, result) {
            // Since callback lists are reset synchronously, the subs list never
            // changes after _notify() receives it. Avoid calling Y.soon() for
            // an empty list
            if (subs.length) {
                // Calling all callbacks after Promise.async to guarantee
                // asynchronicity. Because setTimeout can cause unnecessary
                // delays that *can* become noticeable in some situations
                // (especially in Node.js)
                Promise.async(function () {
                    var i, len;

                    for (i = 0, len = subs.length; i < len; ++i) {
                        subs[i](result);
                    }
                });
            }
        }

    });

    Promise.Resolver = Resolver;

    return Promise;

}));

(function() {
	var global = {};

	global.__CONFIG__ = window.__CONFIG__;

	(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    global.PathResolver = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

/**
 * Creates an instance of PathResolver class.
 *
 * @constructor
 */
function PathResolver() {}

PathResolver.prototype = {
    constructor: PathResolver,

    /**
     * Resolves the path of module.
     *
     * @param {string} module Module path which will be used as reference to resolve the path of the dependency.
     * @param {string} dependency The dependency path, which have to be resolved.
     * @return {string} The resolved dependency path.
     */
    resolvePath: function(module, dependency) {
        if (dependency === 'exports') {
            return dependency;
        }

        // Split module directories
        var moduleParts = module.split('/');
        // Remove module name
        moduleParts.splice(-1);

        // Split dependency directories
        var dependencyParts = dependency.split('/');
        // Extract dependecy name
        var dependencyName = dependencyParts.splice(-1);

        for (var i = 0; i < dependencyParts.length; i++) {
            var dependencyPart = dependencyParts[i];

            if (dependencyPart === '.') {
                continue;

            } else if (dependencyPart === '..') {
                if (moduleParts.length) {
                    moduleParts.splice(-1, 1);
                }
                else {
                    moduleParts = moduleParts.concat(dependencyParts.slice(i));

                    break;
                }

            } else {
                moduleParts.push(dependencyPart);
            }
        }

        moduleParts.push(dependencyName);

        return moduleParts.join('/');
    }
};

    return PathResolver;
}));
(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    global.EventEmitter = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

/**
 * Creates an instance of EventEmitter class.
 *
 * @constructor
 */
function EventEmitter() {
    this._events = {};
}

EventEmitter.prototype = {
    constructor: EventEmitter,

    /**
     * Adds event listener to an event.
     *
     * @param {string} event The name of the event.
     * @param {Function} callback Callback method to be invoked when event is being emitted.
     */
    on: function (event, callback) {
        var listeners = this._events[event] = this._events[event] || [];

        listeners.push(callback);
    },

    /**
     * Removes an event from the list of event listeners to some event.
     *
     * @param {string} event The name of the event.
     * @param {function} callback Callback method to be removed from the list of listeners.
     */
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

    /**
     * Emits an event. The function calls all registered listeners in the order they have been added. The provided args
     * param will be passed to each listener of the event.
     *
     * @param {string} event The name of the event.
     * @param {object} args Object, which will be passed to the listener as only argument.
     */
    emit: function (event, args) {
        var listeners = this._events[event];

        if (listeners) {
            // Slicing is needed to prevent the following situation:
            // A listener is being invoked. During its execution, it may
            // remove itself from the list. In this case, for loop will
            // be damaged, since i will be out of sync.
            listeners = listeners.slice(0);

            for (var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];

                listener.call(listener, args);
            }
        } else {
            console.warn('No listeners for event: ' + event);
        }
    }
};

    return EventEmitter;
}));
(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    global.ConfigParser = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Creates an instance of ConfigurationParser class.
 *
 * @constructor
 * @param {object=} - The configuration object to be parsed.
 */
function ConfigParser(config) {
    this._config = {};
    this._modules = {};
    this._conditionalModules = {};

    this._parseConfig(config);
}

ConfigParser.prototype = {
    constructor: ConfigParser,

    /**
     * Adds a module to the configuration.
     *
     * @param {object} module The module which should be added to the configuration. Should have the following
     *     properties:
     *     <ul>
     *         <strong>Obligatory properties</strong>:
     *         <li>name (String) The name of the module</li>
     *         <li>dependencies (Array) The modules from which it depends</li>
     *     </ul>
     *
     *     <strong>Optional parameters:</strong>
     *     The same as those which config parameter of {@link Loader#define} method accepts.
     */
    addModule: function (module) {
        this._modules[module.name] = module;

        this.resolvePath(module);

        this._registerConditionalModule(module);
    },

    /**
     * Returns the current configuration.
     *
     * @return {object} The current configuration.
     */
    getConfig: function() {
        return this._config;
    },

    /**
     * Returns map with all currently registered conditional modules and their triggers.
     *
     * @return {object} Map with all currently registered conditional modules.
     */
    getConditionalModules: function () {
        return this._conditionalModules;
    },

    /**
     * Returns map with all currently registered modules.
     *
     * @return {object} Map with all currently registered modules.
     */
    getModules: function () {
        return this._modules;
    },

    /**
     * Resolves module path.
     *
     * @param {object} module The module, which path should be resolved.
     */
    resolvePath: function(module) {
        var dependencies = module.dependencies;

        for (var i = 0; i < dependencies.length; i++) {
            var resolvedDependency = this._getPathResolver().resolvePath(module.name, dependencies[i]);

            dependencies[i] = resolvedDependency;
        }
    },

    /**
     * Returns the currently used instance of {@link PathResolver} object.
     *
     * @protected
     * @return {PathResolver} Instance of {@link PathResolver}
     */
    _getPathResolver: function() {
        if (!this._pathResolver) {
            this._pathResolver = new global.PathResolver();
        }

        return this._pathResolver;
    },

    /**
     * Parses configuration object.
     *
     * @protected
     * @param {object} config Configuration object to be parsed.
     * @return {object} The created configuration
     */
    _parseConfig: function (config) {
        for (var key in config) {
            /* istanbul ignore else */
            if (hasOwnProperty.call(config, key)) {
                if (key === 'modules') {
                    this._parseModules(config[key]);
                } else {
                    this._config[key] = config[key];
                }
            }
        }

        return this._config;
    },

    /**
     * Parses a provided modules configuration.
     *
     * @protected
     * @param {object} modules Map of modules to be parsed.
     * @return {object} Map of parsed modules.
     */
    _parseModules: function (modules) {
        for (var key in modules) {
            /* istanbul ignore else */
            if (hasOwnProperty.call(modules, key)) {
                var module = modules[key];

                module.name = key;

                this.addModule(module);
            }
        }

        return this._modules;
    },

    /**
     * Registers conditional module to the configuration.
     *
     * @protected
     * @param {object} module Module object
     */
    _registerConditionalModule: function (module) {
        // Create HashMap of all modules, which have conditional modules, as an Array.
        if (module.condition) {
            var existingModules = this._conditionalModules[module.condition.trigger];

            if (!existingModules) {
                this._conditionalModules[module.condition.trigger] = existingModules = [];
            }

            existingModules.push(module.name);
        }
    }
};

    return ConfigParser;
}));
(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    global.DependencyBuilder = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Creates an instance of DependencyBuilder class.
 *
 * @constructor
 * @param {object} - instance of {@link ConfigParser} object.
 */
function DependencyBuilder(configParser) {
    this._configParser = configParser;

    this._result = [];
}

DependencyBuilder.prototype = {
    constructor: DependencyBuilder,

    /**
     * Resolves modules dependencies.
     *
     * @param {array} modules List of modules which dependencies should be resolved.
     * @return {array} List of module names, representing module dependencies. Module name itself is being returned too.
     */
    resolveDependencies: function (modules) {
        // Copy the passed modules to a resolving modules queue.
        // Modules may be added there during the process of resolving.
        this._queue = modules.slice(0);

        var result;

        try {
            this._resolveDependencies();

            // Reorder the modules list so the modules without dependencies will
            // be moved upfront
            result = this._result.reverse().slice(0);
        }
        finally {
            this._cleanup();
        }

        return result;
    },

    /**
     * Clears the used resources during the process of resolving dependencies.
     *
     * @protected
     */
    _cleanup: function () {
        var modules = this._configParser.getModules();

        // Set to false all temporary markers which were set during the process of
        // dependencies resolving.
        for (var key in modules) {
            /* istanbul ignore else */
            if (hasOwnProperty.call(modules, key)) {
                var module = modules[key];

                module.conditionalMark = false;
                module.mark = false;
                module.tmpMark = false;
            }
        }

        this._queue.length = 0;
        this._result.length = 0;
    },

    /**
     * Processes conditional modules. If a module has conditional module as dependency, this module will be added to
     * the list of modules, which dependencies should be resolved.
     *
     * @protected
     * @param {object} module Module, which will be checked for conditional modules as dependencies.
     */
    _processConditionalModules: function (module) {
        var conditionalModules = this._configParser.getConditionalModules()[module.name];

        // If the current module has conditional modules as dependencies,
        // add them to the list (queue) of modules, which have to be resolved.
        if (conditionalModules && !module.conditionalMark) {
            var modules = this._configParser.getModules();

            for (var i = 0; i < conditionalModules.length; i++) {
                var conditionalModule = modules[conditionalModules[i]];

                if (this._queue.indexOf(conditionalModule.name) === -1 && this._testConditionalModule(conditionalModule.condition.test)) {

                    this._queue.push(conditionalModule.name);
                }
            }

            module.conditionalMark = true;
        }
    },

    /**
     * Processes all modules in the {@link DependencyBuilder#_queue} and resolves their dependencies. The function
     * implements standard
     * [topological sorting based on depth-first search]{@link http://en.wikipedia.org/wiki/Topological_sorting}.
     *
     * @protected
     */
    _resolveDependencies: function () {
        // Process all modules in the queue.
        // Note: modules may be added to the queue during the process of evaluating.
        var modules = this._configParser.getModules();

        for (var i = 0; i < this._queue.length; i++) {
            var module = modules[this._queue[i]];

            if (!module.mark) {
                this._visit(module);
            }
        }
    },

    /**
     * Executes the test function of an conditional module and adds it to the list of module dependencies if the
     * function returns true.
     *
     * @param {function|string} testFunction The function which have to be executed. May be Function object or string.
     * @return {boolean} The result of the execution of the test function.
     */
    _testConditionalModule: function (testFunction) {
        if (typeof testFunction === 'function') {
            return testFunction();
        } else {
            return eval('false || ' + testFunction)();
        }
    },

    /**
     * Visits a module during the process of resolving dependencies. The function will throw exception in case of
     * circular dependencies among modules.
     *
     * @protected
     * @param {object} module The module which have to be visited.
     */
    _visit: function (module) {
        // Directed Acyclic Graph is supported only, throw exception if there are circular dependencies.
        if (module.tmpMark) {
            throw new Error('Error processing module: ' + module.name + '. ' + 'The provided configuration is not Directed Acyclic Graph.');
        }

        // Check if this module has conditional modules and add them to the queue if so.
        this._processConditionalModules(module);

        if (!module.mark) {
            module.tmpMark = true;

            var modules = this._configParser.getModules();

            for (var i = 0; i < module.dependencies.length; i++) {
                var dependencyName = module.dependencies[i];

                if (dependencyName === 'exports') {
                    continue;
                }

                var moduleDependency = modules[dependencyName];

                this._visit(moduleDependency, modules);
            }

            module.mark = true;

            module.tmpMark = false;

            this._result.unshift(module.name);
        }
    },

    /**
     * @property {array} _queue List of modules, which dependencies should be resolved. Initially, it is copy of
     * the array of modules, passed for resolving; during the process more modules may be added to the queue. For
     * example, these might be conditional modules.
     *
     * @protected
     * @memberof! DependencyBuilder#
     * @default []
     */
    _queue: []
};

    return DependencyBuilder;
}));
(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    global.URLBuilder = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

/**
 * Creates an instance of URLBuilder class.
 *
 * @constructor
 * @param {object} - instance of {@link ConfigParser} object.
 */
function URLBuilder(configParser) {
    this._configParser = configParser;
}

URLBuilder.prototype = {
    constructor: URLBuilder,

    /**
     * Returns a list of URLs from provided list of modules.
     *
     * @param {array} modules List of modules for which URLs should be created.
     * @return {array} List of URLs.
     */
    build: function (modules) {
        var buffer = [];
        var result = [];

        var registeredModules = this._configParser.getModules();
        var config = this._configParser.getConfig();

        var basePath = config.basePath;

        /* istanbul ignore else */
        if (basePath.charAt(basePath.length - 1) !== '/') {
            basePath += '/';
        }

        for (var i = 0; i < modules.length; i++) {
            var module = registeredModules[modules[i]];

            // If module has fullPath or combine is false, individual URLs have to be created.
            if (module.fullPath) {
                result.push(module.fullPath);

            // If there is no combine, we have to generate full path URL
            } else if (!config.combine) {
                result.push(config.url + basePath + this._getModulePath(module));

            } else {
                // If combine is true and module does not have full path, it will be collected
                // in a buffer to be loaded among with other modules from combo loader.
                buffer.push(this._getModulePath(module));
            }

            module.load = true;
        }

        // Add to the result all modules, which have to be combined.
        if (buffer.length) {
            result.push(config.url + '?' + basePath + buffer.join('&' + basePath));

            buffer.length = 0;
        }

        return result;
    },

    /**
     * Returns the path for a module. If module has property path, it will be returned directly. Otherwise,
     * the name of module will be used and extension .js will be added to module name if omitted.
     *
     * @protected
     * @param {object} module The module which path should be returned.
     * @return {string} Module path.
     */
    _getModulePath: function(module) {
        if (module.path) {
            return module.path;

        } else if (module.name.indexOf('.js') !== module.name.length - 3) {
            return module.name + '.js';

        } else {
            return module.name;
        }
    }
};

    return URLBuilder;
}));
(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    /* jshint newcap:false */
    global.Loader = new built();
    global.require = global.Loader.require.bind(global.Loader);
    global.define = global.Loader.define.bind(global.Loader);
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

/**
 * Creates an instance of Loader class.
 *
 * @namespace Loader
 * @extends EventEmitter
 * @constructor
 */
function Loader(config) {
    Loader.superclass.constructor.apply(this, arguments);

    this._config = config || global.__CONFIG__;
}

extend(Loader, global.EventEmitter, {
    /**
     * Defines a module.
     *
     * @memberof! Loader#
     * @param {string} name The name of the module.
     * @param {array} dependencies List of module dependencies.
     * @param {function} implementation The implementation of the method.
     * @param {object=} config Object configuration:
     * <ul>
     *         <strong>Optional properties</strong>:
     *         <li>path (String) - Explicitly set path of the module. If omitted, module name will be used as path</li>
     *         <li>condition (Object) Object which represents if the module should be added automatically after another
     *             module.
     *         It should have the following properties:</li>
     *             <ul>
     *                 <li>trigger - the module, which should trigger the loading of the current module</li>
     *                 <li>test - function, which should return true if module should be loaded</li>
     *         </ul>
     *     </ul>
     * @return {Promise} Promise, will be resolved as soon as module is being registered.
     */
    define: function (name, dependencies, implementation, config) {
        var self = this;

        return new Promise(function (resolve, reject) {
            // Create new module by merging the provided config with the passed name,
            // dependencies and the implementation.
            var module = config || {};

            module.name = name;
            module.dependencies = dependencies;
            module.pendingImplementation = implementation;

            self._getConfigParser().resolvePath(module);

            var dependeciesResolved = self._checkModuleDependencies(module);

            if (dependeciesResolved) {
                self._registerModule(module);

                resolve(module);
            } else {
                self._waitForImplementation(module)
                    .then(function(module) {
                        self._registerModule(module);
                    });
            }
        });
    },

    /**
     * Returns list of currently registered conditional modules.
     *
     * @memberof! Loader#
     * @return {array} List of currently registered conditional modules.
     */
    getConditionalModules: function() {
        return this._getConfigParser().getConditionalModules();
    },

    /**
     * Returns list of currently registered modules.
     *
     * @memberof! Loader#
     * @return {array} List of currently registered modules.
     */
    getModules: function() {
        return this._getConfigParser().getModules();
    },

    /**
     * Requires list of modules. If a module is not yet registered, it will be ignored and its implementation
     * in the provided success callback will be left undefined.<br>
     *
     * @memberof! Loader#
     * @param {array|string[]} modules Modules can be specified as an array of strings or provided as
     *     multiple string parameters.
     * @param {function} success Callback, which will be invoked in case of success. The provided parameters will
     *     be implementations of all required modules.
     * @param {function} failure Callback, which will be invoked in case of failure. One parameter with
     *     information about the error will be provided.
     */
    require: function () {
        var self = this;

        var failureCallback;
        var modules;
        var successCallback;

        // Modules can be specified by as an array, or just as parameters to the function
        // We do not slice or leak arguments to not cause V8 performance penalties
        // TODO: This could be improved with inline function (hint)

        var isArgsArray = Array.isArray ? Array.isArray(arguments[0]) : /* istanbul ignore next */
            Object.prototype.toString.call(arguments[0]) === '[object Array]';

        if (isArgsArray) {
            modules = arguments[0];
            successCallback = typeof arguments[1] === 'function' ? arguments[1] : null;
            failureCallback = typeof arguments[2] === 'function' ? arguments[2] : null;

        } else {
            modules = [];

            for (var i = 0; i < arguments.length; ++i) {
                if (typeof arguments[i] === 'string') {
                    modules[i] = arguments[i];

                /* istanbul ignore else */
                } else if (typeof arguments[i] === 'function') {
                    successCallback = arguments[i];
                    failureCallback = typeof arguments[++i] === 'function' ? arguments[i] : /* istanbul ignore next */ null;

                    break;
                }
            }
        }

        // Resolve the dependencies of the specified modules by the user
        // then load their JS scripts
        self._resolveDependencies(modules).then(function (dependencies) {
            return self._loadModules(dependencies);
        }).then(function (loadedModules) {
            var moduleImplementations = self._addModuleImplementations(modules);

            /* istanbul ignore else */
            if (successCallback) {
                successCallback.apply(successCallback, moduleImplementations);
            }
        }, function (error) {
            /* istanbul ignore else */
            if (failureCallback) {
                failureCallback.call(failureCallback, error);

            }
        });
    },

    /**
     * Adds module implementations to an array.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} requiredModules Lit of modules, which implementations will be added to an array.
     * @return {array} List of modules implementations.
     */
    _addModuleImplementations: function (requiredModules) {
        var moduleImplementations = [];

        var modules = this._getConfigParser().getModules();

        for (var i = 0; i < requiredModules.length; i++) {
            var requiredModule = modules[requiredModules[i]];

            moduleImplementations.push(requiredModule ? requiredModule.implementation : undefined);
        }

        return moduleImplementations;
    },

    /**
     * Checks if all module dependencies have implementations (aka they were registered) as valid modules.
     *
     * @memberof! Loader#
     * @protected
     * @param {object} module The module which dependencies should be checked.
     * @return {boolean} Returns true if all module dependencies have implementations.
     */
    _checkModuleDependencies: function (module) {
        var modules = this._getConfigParser().getModules();

        var found = true;

        var dependencies = module.dependencies;

        for (var i = 0; i < dependencies.length; i++) {
            var dependencyName = dependencies[i];

            /* istanbul ignore else */
            if (dependencyName === 'exports') {
                continue;

            }

            var dependencyModule = modules[dependencyName];

            if (!dependencyModule) {
                throw 'Dependency ' + dependencies[i] + ' not registered as module.';
            }

            var dependencyModuleImpl = dependencyModule.implementation;

            if (!dependencyModuleImpl) {
                found = false;

                break;
            }
        }

        return found;
    },

    /**
     * Returns instance of {@link ConfigParser} class currently used.
     *
     * @memberof! Loader#
     * @protected
     * @return {ConfigParser} Instance of {@link ConfigParser} class.
     */
    _getConfigParser: function () {
        /* istanbul ignore else */
        if (!this._configParser) {
            this._configParser = new global.ConfigParser(this._config);
        }

        return this._configParser;
    },

    /**
     * Returns instance of {@link DependencyBuilder} class currently used.
     *
     * @memberof! Loader#
     * @protected
     * @return {DependencyBuilder} Instance of {@link DependencyBuilder} class.
     */
    _getDependencyBuilder: function () {
        if (!this._dependencyBuilder) {
            this._dependencyBuilder = new global.DependencyBuilder(this._getConfigParser());
        }

        return this._dependencyBuilder;
    },

    /**
     * Returns instance of {@link URLBuilder} class currently used.
     *
     * @memberof! Loader#
     * @protected
     * @return {URLBuilder} Instance of {@link URLBuilder} class.
     */
    _getURLBuilder: function () {
        /* istanbul ignore else */
        if (!this._urlBuilder) {
            this._urlBuilder = new global.URLBuilder(this._getConfigParser());
        }

        return this._urlBuilder;
    },

    /**
     * Filters a list of modules and returns only these without implementation.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules which which will be filtered.
     * @return {array} List of modules without implementation.
     */
    _filterModulesNoImpl: function(modules) {
        var missingModules = [];

        var registeredModules = this._getConfigParser().getModules();

        for (var i = 0; i < modules.length; i++) {
            var registeredModule = registeredModules[modules[i]];

            // Get all modules which don't have implementation, except 'exports' module
            if (registeredModule !== 'exports' &&
                (!registeredModule || !registeredModule.implementation)) {

                missingModules.push(modules[i]);
            }
        }

        return missingModules;
    },

    /**
     * Filters a list of modules and returns only these which have been not yet requested for delivery via network.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules which which will be filtered.
     * @return {array} List of modules not yet requested for delivery via network.
     */
    _filterNotLoadedModules: function (modules) {
        var missingModules = [];

        var registeredModules = this._getConfigParser().getModules();

        for (var i = 0; i < modules.length; i++) {
            var registeredModule = registeredModules[modules[i]];

            // Get all modules which don't have implementarion and they were not requested from the server.
            if (registeredModule !== 'exports' &&
                (!registeredModule || (!registeredModule.implementation && !registeredModule.load))) {

                missingModules.push(modules[i]);
            }
        }

        return missingModules;
    },

    /**
     * Loads list of modules.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules to be loaded.
     * @return {Promise} Promise, which will be resolved as soon as all module a being loaded.
     */
    _loadModules: function (modules) {
        var self = this;

        return new Promise(function (resolve, reject) {
            // First, detect any still unloaded modules
            var missingModules = self._filterNotLoadedModules(modules);

            if (missingModules.length) {
                // If there are any, construct the URLs for them
                var urls = self._getURLBuilder().build(missingModules);

                var pendingScripts = [];

                // Create promises for each of the scripts, which should be loaded
                for (var i = 0; i < urls.length; i++) {
                    pendingScripts.push(self._loadScript(urls[i]));
                }

                // Wait for resolving the all script Promises
                // As soon as that happens, wait for each module to resolve
                // its own dependencies
                Promise.all(pendingScripts).then(function (loadedScripts) {
                    return self._waitForImplementations(modules);
                })
                // As soon as all scripts were loaded and all dependencies have been resolved,
                // resolve the main Promise
                .then(function(modules) {
                    resolve(modules);
                })
                // If any script fails to load or other error happens,
                // reject the main Promise
                .catch (function (error) {
                    reject(error);
                });
            } else {
                // If there are no any mising modules, just wait for modules dependecies
                // to be resolved and then resolve the main promise
                self._waitForImplementations(modules)
                    .then(function(modules) {
                        resolve(modules);
                    })
                    // If some error happens, for example if some module implementation
                    // throws error, reject the main Promise
                    .catch (function (error) {
                        reject(error);
                    });
            }
        });
    },

    /**
     * Registers a module and fires {@link Loader#event:moduleRegister} event with the registered module as param.
     *
     * @memberof! Loader#
     * @protected
     * @param {object} module Module which have to be registered.
     * @fires Loader#moduleRegister
     */
    _registerModule: function (module) {
        var dependencyImplementations = [];

        var configParser = this._getConfigParser();

        var modules = configParser.getModules();

        // Leave exports implementation undefined by default
        var exportsImpl;

        for (var i = 0; i < module.dependencies.length; i++) {
            var dependency = module.dependencies[i];

            var impl;

            // If the current dependency of this module is 'exports',
            // create an empty object and pass it as implementation of
            // 'exports' module
            if (dependency === 'exports') {
                exportsImpl = {};

                dependencyImplementations.push(exportsImpl);
            }
            else {
                // otherwise set as value the implementation of the
                // registered module
                var dependencyModule = modules[dependency];

                impl = dependencyModule.implementation;

                dependencyImplementations.push(impl);
            }
        }

        var result = module.pendingImplementation.apply(module.pendingImplementation, dependencyImplementations);

        // Store as implementation either the returned value from function invocation
        // or the implementation of the 'exports' object.
        // The final implementation of this module may be undefined if there is no
        // returned value, or the object does not have 'exports' dependency
        module.implementation = result || exportsImpl;

        configParser.addModule(module);

        this.emit('moduleRegister', module);
    },

    /**
     * Resolves modules dependencies.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules which dependencies should be resolved.
     * @return {Promise} Promise which will be resolved as soon as all dependencies are being resolved.
     */
    _resolveDependencies: function (modules) {
        var self = this;

        return new Promise(function (resolve, reject) {
            try {
                var registeredModules = self._getConfigParser().getModules();
                var finalModules = [];

                // Ignore wrongly specified byt the user (misspelled) modules
                for (var i = 0; i < modules.length; i++) {
                    if (registeredModules[modules[i]]) {
                        finalModules.push(modules[i]);
                    }
                }

                var dependencies = self._getDependencyBuilder().resolveDependencies(finalModules);

                resolve(dependencies);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Loads a &ltscript&gt element on the page.
     *
     * @memberof! Loader#
     * @protected
     * @param {string} url The src of the script.
     * @return {Promise} Promise which will be resolved as soon as the script is being loaded.
     */
    _loadScript: function (url) {
        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');

            script.src = url;

            // On ready state change is needed for IE < 9, not sure if that is needed anymore,
            // it depends which browsers will we support at the end
            script.onload = script.onreadystatechange = function () {
                /* istanbul ignore else */
                if (!this.readyState || /* istanbul ignore next */ this.readyState === 'complete' || /* istanbul ignore next */ this.readyState === 'load') {

                    script.onload = script.onreadystatechange = null;

                    resolve(script);
                }
            };

            // If some script fails to load, reject the main Promise
            script.onerror = function () {
                document.body.removeChild(script);

                reject(script);
            };

            document.body.appendChild(script);
        });
    },

    /**
     * Resolves a Promise as soon as all module dependencies are being resolved and it has implementation.
     *
     * @memberof! Loader#
     * @protected
     * @param {object} module The module for which implementation this function should wait.
     * @return {Promise}
     */
    _waitForImplementation: function(module) {
        var self = this;

        return new Promise(function(resolve, reject) {
            if (module.implementation) {
                resolve(module);

            } else {
                var onModuleRegister = function (registeredModule) {
                    var dependenciesResolved = self._checkModuleDependencies(module);

                    if (dependenciesResolved) {
                        self.off('moduleRegister', onModuleRegister);

                        resolve(module);
                    }
                };

                self.on('moduleRegister', onModuleRegister);
            }
        });
    },

    /**
     * Resolves a Promise as soon as all dependencies of all provided modules are being resolved and modules have
     * implementations.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules for which implementations this function should wait.
     * @return {Promise}
     */
    _waitForImplementations: function(modules) {
        var self = this;

        return new Promise(function(resolve, reject) {
            var missingModules = self._filterModulesNoImpl(modules);

            if (!missingModules.length) {
                resolve(modules);
            } else {
                var modulesPromises = [];

                var registeredModules = self._getConfigParser().getModules();

                for (var i = 0; i < modules.length; i++) {
                    modulesPromises.push(self._waitForImplementation(registeredModules[missingModules[i]]));
                }

                Promise.all(modulesPromises)
                    .then(function(modules) {
                        resolve(modules);
                    });
            }
        });
    }

    /**
     * Indicates that a module has been registered.
     *
     * @event Loader#moduleRegister
     * @param {object} module - The registered module.
     */
});

// Utilities methods
function extend(r, s, px) {
    /* istanbul ignore if else */
    if (!s || !r) {
        throw ('extend failed, verify dependencies');
    }

    var sp = s.prototype,
        rp = Object.create(sp);
    r.prototype = rp;

    rp.constructor = r;
    r.superclass = sp;

    /* istanbul ignore if else */
    // assign constructor property
    if (s != Object && sp.constructor == Object.prototype.constructor) {
        sp.constructor = s;
    }

    /* istanbul ignore else */
    // add prototype overrides
    if (px) {
        mix(rp, px);
    }

    return r;
}

function mix(destination, source) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    for (var k in source) {
        /* istanbul ignore else */
        if (hasOwnProperty.call(source, k)) {
            destination[k] = source[k];
        }
    }

    return destination;
}

    return Loader;
}));

	window.Loader = global.Loader;
    window.require = global.require;
    window.define = global.define;
}());