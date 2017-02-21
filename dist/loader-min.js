!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.ES6Promise=t()}(this,function(){"use strict";function e(e){return"function"==typeof e||"object"==typeof e&&null!==e}function t(e){return"function"==typeof e}function n(e){K=e}function o(e){z=e}function r(){return function(){return process.nextTick(l)}}function i(){return"undefined"!=typeof Y?function(){Y(l)}:a()}function s(){var e=0,t=new Q(l),n=document.createTextNode("");return t.observe(n,{characterData:!0}),function(){n.data=e=++e%2}}function u(){var e=new MessageChannel;return e.port1.onmessage=l,function(){return e.port2.postMessage(0)}}function a(){var e=setTimeout;return function(){return e(l,1)}}function l(){for(var e=0;e<V;e+=2){var t=$[e],n=$[e+1];t(n),$[e]=void 0,$[e+1]=void 0}V=0}function c(){try{var e=require,t=e("vertx");return Y=t.runOnLoop||t.runOnContext,i()}catch(n){return a()}}function f(e,t){var n=arguments,o=this,r=new this.constructor(h);void 0===r[te]&&E(r);var i=o._state;return i?!function(){var e=n[i-1];z(function(){return A(i,r,e,o._result)})}():x(o,r,e,t),r}function d(e){var t=this;if(e&&"object"==typeof e&&e.constructor===t)return e;var n=new t(h);return M(n,e),n}function h(){}function p(){return new TypeError("You cannot resolve a promise with itself")}function _(){return new TypeError("A promises callback cannot return that same promise.")}function g(e){try{return e.then}catch(t){return ie.error=t,ie}}function m(e,t,n,o){try{e.call(t,n,o)}catch(r){return r}}function v(e,t,n){z(function(e){var o=!1,r=m(n,t,function(n){o||(o=!0,t!==n?M(e,n):P(e,n))},function(t){o||(o=!0,C(e,t))},"Settle: "+(e._label||" unknown promise"));!o&&r&&(o=!0,C(e,r))},e)}function y(e,t){t._state===oe?P(e,t._result):t._state===re?C(e,t._result):x(t,void 0,function(t){return M(e,t)},function(t){return C(e,t)})}function b(e,n,o){n.constructor===e.constructor&&o===f&&n.constructor.resolve===d?y(e,n):o===ie?C(e,ie.error):void 0===o?P(e,n):t(o)?v(e,n,o):P(e,n)}function M(t,n){t===n?C(t,p()):e(n)?b(t,n,g(n)):P(t,n)}function w(e){e._onerror&&e._onerror(e._result),O(e)}function P(e,t){e._state===ne&&(e._result=t,e._state=oe,0!==e._subscribers.length&&z(O,e))}function C(e,t){e._state===ne&&(e._state=re,e._result=t,z(w,e))}function x(e,t,n,o){var r=e._subscribers,i=r.length;e._onerror=null,r[i]=t,r[i+oe]=n,r[i+re]=o,0===i&&e._state&&z(O,e)}function O(e){var t=e._subscribers,n=e._state;if(0!==t.length){for(var o=void 0,r=void 0,i=e._result,s=0;s<t.length;s+=3)o=t[s],r=t[s+n],o?A(n,o,r,i):r(i);e._subscribers.length=0}}function L(){this.error=null}function j(e,t){try{return e(t)}catch(n){return se.error=n,se}}function A(e,n,o,r){var i=t(o),s=void 0,u=void 0,a=void 0,l=void 0;if(i){if(s=j(o,r),s===se?(l=!0,u=s.error,s=null):a=!0,n===s)return void C(n,_())}else s=r,a=!0;n._state!==ne||(i&&a?M(n,s):l?C(n,u):e===oe?P(n,s):e===re&&C(n,s))}function R(e,t){try{t(function(t){M(e,t)},function(t){C(e,t)})}catch(n){C(e,n)}}function I(){return ue++}function E(e){e[te]=ue++,e._state=void 0,e._result=void 0,e._subscribers=[]}function B(e,t){this._instanceConstructor=e,this.promise=new e(h),this.promise[te]||E(this.promise),W(t)?(this._input=t,this.length=t.length,this._remaining=t.length,this._result=new Array(this.length),0===this.length?P(this.promise,this._result):(this.length=this.length||0,this._enumerate(),0===this._remaining&&P(this.promise,this._result))):C(this.promise,S())}function S(){return new Error("Array Methods must be provided an Array")}function k(e){return new B(this,e).promise}function F(e){var t=this;return new t(W(e)?function(n,o){for(var r=e.length,i=0;i<r;i++)t.resolve(e[i]).then(n,o)}:function(e,t){return t(new TypeError("You must pass an array to race."))})}function G(e){var t=this,n=new t(h);return C(n,e),n}function D(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function q(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function N(e){this[te]=I(),this._result=this._state=void 0,this._subscribers=[],h!==e&&("function"!=typeof e&&D(),this instanceof N?R(this,e):q())}function T(){var e=void 0;if("undefined"!=typeof global)e=global;else if("undefined"!=typeof self)e=self;else try{e=Function("return this")()}catch(t){throw new Error("polyfill failed because global object is unavailable in this environment")}var n=e.Promise;if(n){var o=null;try{o=Object.prototype.toString.call(n.resolve())}catch(t){}if("[object Promise]"===o&&!n.cast)return}e.Promise=N}var U=void 0;U=Array.isArray?Array.isArray:function(e){return"[object Array]"===Object.prototype.toString.call(e)};var W=U,V=0,Y=void 0,K=void 0,z=function(e,t){$[V]=e,$[V+1]=t,V+=2,2===V&&(K?K(l):ee())},H="undefined"!=typeof window?window:void 0,J=H||{},Q=J.MutationObserver||J.WebKitMutationObserver,X="undefined"==typeof self&&"undefined"!=typeof process&&"[object process]"==={}.toString.call(process),Z="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,$=new Array(1e3),ee=void 0;ee=X?r():Q?s():Z?u():void 0===H&&"function"==typeof require?c():a();var te=Math.random().toString(36).substring(16),ne=void 0,oe=1,re=2,ie=new L,se=new L,ue=0;return B.prototype._enumerate=function(){for(var e=this.length,t=this._input,n=0;this._state===ne&&n<e;n++)this._eachEntry(t[n],n)},B.prototype._eachEntry=function(e,t){var n=this._instanceConstructor,o=n.resolve;if(o===d){var r=g(e);if(r===f&&e._state!==ne)this._settledAt(e._state,t,e._result);else if("function"!=typeof r)this._remaining--,this._result[t]=e;else if(n===N){var i=new n(h);b(i,e,r),this._willSettleAt(i,t)}else this._willSettleAt(new n(function(t){return t(e)}),t)}else this._willSettleAt(o(e),t)},B.prototype._settledAt=function(e,t,n){var o=this.promise;o._state===ne&&(this._remaining--,e===re?C(o,n):this._result[t]=n),0===this._remaining&&P(o,this._result)},B.prototype._willSettleAt=function(e,t){var n=this;x(e,void 0,function(e){return n._settledAt(oe,t,e)},function(e){return n._settledAt(re,t,e)})},N.all=k,N.race=F,N.resolve=d,N.reject=G,N._setScheduler=n,N._setAsap=o,N._asap=z,N.prototype={constructor:N,then:f,"catch":function(e){return this.then(null,e)}},N.polyfill=T,N.Promise=N,N}),function(){var global={};global.__CONFIG__=window.__CONFIG__,function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.EventEmitter=n}("undefined"!=typeof global?global:this,function(e){"use strict";function t(){this._events={}}return t.prototype={constructor:t,on:function(e,t){var n=this._events[e]=this._events[e]||[];n.push(t)},off:function(e,t){var n=this._events[e];if(n){var o=n.indexOf(t);o>-1&&n.splice(o,1)}},emit:function(e,t){var n=this._events[e];if(n){n=n.slice(0);for(var o=0;o<n.length;o++){var r=n[o];r.call(r,t)}}}},t}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.ConfigParser=n}("undefined"!=typeof global?global:this,function(e){"use strict";function t(e){this._config={},this._modules={},this._conditionalModules={},this._parseConfig(e)}return t.prototype={constructor:t,addModule:function(e){var t=this._modules[e.name];if(t)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);else this._modules[e.name]=e;return this._registerConditionalModule(e),this._modules[e.name]},getConfig:function(){return this._config},getConditionalModules:function(){return this._conditionalModules},getModules:function(){return this._modules},mapModule:function(e){if(!this._config.maps)return e;var t;t=Array.isArray(e)?e:[e];for(var n=0;n<t.length;n++){var o=t[n],r=!1;for(var i in this._config.maps)if(Object.prototype.hasOwnProperty.call(this._config.maps,i)&&(o===i||0===o.indexOf(i+"/"))){o=this._config.maps[i]+o.substring(i.length),t[n]=o,r=!0;break}r||"function"!=typeof this._config.maps["*"]||(t[n]=this._config.maps["*"](o))}return Array.isArray(e)?t:t[0]},_parseConfig:function(e){for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&("modules"===t?this._parseModules(e[t]):this._config[t]=e[t]);return this._config},_parseModules:function(e){for(var t in e)if(Object.prototype.hasOwnProperty.call(e,t)){var n=e[t];n.name=t,this.addModule(n)}return this._modules},_registerConditionalModule:function(e){if(e.condition){var t=this._conditionalModules[e.condition.trigger];t||(this._conditionalModules[e.condition.trigger]=t=[]),t.push(e.name)}}},t}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.DependencyBuilder=n}("undefined"!=typeof global?global:this,function(global){"use strict";function DependencyBuilder(e){this._configParser=e,this._pathResolver=new global.PathResolver,this._result=[]}var hasOwnProperty=Object.prototype.hasOwnProperty;return DependencyBuilder.prototype={constructor:DependencyBuilder,resolveDependencies:function(e){this._queue=e.slice(0);var t;try{this._resolveDependencies(),t=this._result.reverse().slice(0)}finally{this._cleanup()}return t},_cleanup:function(){var e=this._configParser.getModules();for(var t in e)if(hasOwnProperty.call(e,t)){var n=e[t];n.conditionalMark=!1,n.mark=!1,n.tmpMark=!1}this._queue.length=0,this._result.length=0},_processConditionalModules:function(e){var t=this._configParser.getConditionalModules()[e.name];if(t&&!e.conditionalMark){for(var n=this._configParser.getModules(),o=0;o<t.length;o++){var r=n[t[o]];this._queue.indexOf(r.name)===-1&&this._testConditionalModule(r.condition.test)&&this._queue.push(r.name)}e.conditionalMark=!0}},_resolveDependencies:function(){for(var e=this._configParser.getModules(),t=0;t<this._queue.length;t++){var n=e[this._queue[t]];n||(n=this._configParser.addModule({name:this._queue[t],dependencies:[]})),n.mark||this._visit(n)}},_testConditionalModule:function(testFunction){return"function"==typeof testFunction?testFunction():eval("false || "+testFunction)()},_visit:function(e){if(e.tmpMark)throw new Error("Error processing module: "+e.name+". The provided configuration is not Directed Acyclic Graph.");if(this._processConditionalModules(e),!e.mark){e.tmpMark=!0;for(var t=this._configParser.getModules(),n=0;n<e.dependencies.length;n++){var o=e.dependencies[n];if("exports"!==o&&"module"!==o){o=this._pathResolver.resolvePath(e.name,o);var r=this._configParser.mapModule(o),i=t[r];i||(i=this._configParser.addModule({name:r,dependencies:[]})),this._visit(i)}}e.mark=!0,e.tmpMark=!1,this._result.unshift(e.name)}},_queue:[]},DependencyBuilder}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.URLBuilder=n}("undefined"!=typeof global?global:this,function(e){"use strict";function t(e){this._configParser=e}var n=/^https?:\/\/|\/\/|www\./;return t.prototype={constructor:t,build:function(e){var t=[],o=[],r=[],i=[],s=[],u=this._configParser.getConfig(),a=u.basePath||"",l=this._configParser.getModules();a.length&&"/"!==a.charAt(a.length-1)&&(a+="/");for(var c=0;c<e.length;c++){var f=l[e[c]];if(f.fullPath)s.push({modules:[f.name],url:this._getURLWithParams(f.fullPath)});else{var d=this._getModulePath(f),h=0===d.indexOf("/");n.test(d)?s.push({modules:[f.name],url:this._getURLWithParams(d)}):!u.combine||f.anonymous?s.push({modules:[f.name],url:this._getURLWithParams(u.url+(h?"":a)+d)}):h?(t.push(d),r.push(f.name)):(o.push(d),i.push(f.name))}f.requested=!0}return o.length&&(s=s.concat(this._generateBufferURLs(i,o,{basePath:a,url:u.url,urlMaxLength:u.urlMaxLength})),o.length=0),t.length&&(s=s.concat(this._generateBufferURLs(r,t,{url:u.url,urlMaxLength:u.urlMaxLength})),t.length=0),s},_generateBufferURLs:function(e,t,n){var o,r=n.basePath||"",i=[],s=n.urlMaxLength||2e3,u={modules:[e[0]],url:n.url+r+t[0]};for(o=1;o<t.length;o++){var a=e[o],l=t[o];u.url.length+r.length+l.length+1<s?(u.modules.push(a),u.url+="&"+r+l):(i.push(u),u={modules:[a],url:n.url+r+l})}return u.url=this._getURLWithParams(u.url),i.push(u),i},_getModulePath:function(e){var t=e.path||e.name,o=this._configParser.getConfig().paths||{},r=!1;return Object.keys(o).forEach(function(e){t!==e&&0!==t.indexOf(e+"/")||(t=o[e]+t.substring(e.length))}),r||"function"!=typeof o["*"]||(t=o["*"](t)),n.test(t)||t.lastIndexOf(".js")===t.length-3||(t+=".js"),t},_getURLWithParams:function(e){var t=this._configParser.getConfig(),n=t.defaultURLParams||{},o=Object.keys(n);if(!o.length)return e;var r=o.map(function(e){return e+"="+n[e]}).join("&");return e+(e.indexOf("?")>-1?"&":"?")+r}},t}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.PathResolver=n}("undefined"!=typeof global?global:this,function(e){"use strict";function t(){}return t.prototype={constructor:t,resolvePath:function(e,t){if("exports"===t||"module"===t||0!==t.indexOf(".")&&0!==t.indexOf(".."))return t;var n=e.split("/");n.splice(-1,1);for(var o=t.split("/"),r=o.splice(-1,1),i=0;i<o.length;i++){var s=o[i];if("."!==s)if(".."===s){if(!n.length){n=n.concat(o.slice(i));break}n.splice(-1,1)}else n.push(s)}return n.push(r),n.join("/")}},t}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.Loader=new n,e.require=e.Loader.require.bind(e.Loader),e.define=e.Loader.define.bind(e.Loader),e.define.amd={}}("undefined"!=typeof global?global:this,function(e){"use strict";function t(n){t.superclass.constructor.apply(this,arguments),this._config=n||e.__CONFIG__,this._modulesMap={}}t.prototype=Object.create(e.EventEmitter.prototype),t.prototype.constructor=t,t.superclass=e.EventEmitter.prototype;var n={addModule:function(e){return this._getConfigParser().addModule(e)},define:function(){var e=this,t=arguments[0],n=arguments[1],o=arguments[2],r=arguments[3]||{};r.anonymous=!1;var i=arguments.length;if(i<2?(o=arguments[0],n=["module","exports"],r.anonymous=!0):2===i&&("string"==typeof t?(n=["module","exports"],o=arguments[1]):(n=arguments[0],o=arguments[1],r.anonymous=!0)),r.anonymous){var s=function(t){if(e.off("scriptLoaded",s),1!==t.length)e._reportMismatchedAnonymousModules(o.toString());else{var i=t[0],u=e.getModules()[i];u&&u.pendingImplementation&&e._reportMismatchedAnonymousModules(o.toString()),e._define(i,n,o,r)}};e.on("scriptLoaded",s)}else this._define(t,n,o,r)},getConditionalModules:function(){return this._getConfigParser().getConditionalModules()},getModules:function(){return this._getConfigParser().getModules()},require:function(){var e,t,n,o,r=this;if(Array.isArray(arguments[0]))n=arguments[0],o="function"==typeof arguments[1]?arguments[1]:null,e="function"==typeof arguments[2]?arguments[2]:null;else for(n=[],t=0;t<arguments.length;++t)if("string"==typeof arguments[t])n[t]=arguments[t];else if("function"==typeof arguments[t]){o=arguments[t],e="function"==typeof arguments[++t]?arguments[t]:null;break}var i,s=r._getConfigParser(),u=s.mapModule(n);new Promise(function(e,t){r._resolveDependencies(u).then(function(o){var a=s.getConfig();0!==a.waitTimeout&&(i=setTimeout(function(){var e=s.getModules(),r=new Error("Load timeout for modules: "+n);r.dependecies=o,r.mappedModules=u,r.missingDependencies=o.filter(function(t){return!e[t].implementation}),r.modules=n,t(r)},a.waitTimeout||7e3)),r._loadModules(o).then(e,t)},t)}).then(function(e){if(clearTimeout(i),o){var t=r._getModuleImplementations(u);o.apply(o,t)}},function(t){clearTimeout(i),e&&e.call(e,t)})},_createModulePromise:function(e){var t=this;return new Promise(function(n,o){var r=t._getConfigParser().getModules(),i=r[e];if(i.exports){var s=t._getValueGlobalNS(i.exports);if(s)n(s);else{var u=function(r){if(r.indexOf(e)>=0){t.off("scriptLoaded",u);var s=t._getValueGlobalNS(i.exports);s?n(s):o(new Error("Module "+e+" does not export the specified value: "+i.exports))}};t.on("scriptLoaded",u)}}else{var a=function(o){o===e&&(t.off("moduleRegister",a),t._modulesMap[e]=!0,n(e))};t.on("moduleRegister",a)}})},_define:function(e,t,n,o){var r=o||{},i=this._getConfigParser(),s=this._getPathResolver();t=t.map(function(t){return s.resolvePath(e,t)}),r.name=e,r.dependencies=t,r.pendingImplementation=n,i.addModule(r),this._modulesMap[r.name]||(this._modulesMap[r.name]=!0),this.emit("moduleRegister",e)},_getConfigParser:function(){return this._configParser||(this._configParser=new e.ConfigParser(this._config)),this._configParser},_getDependencyBuilder:function(){return this._dependencyBuilder||(this._dependencyBuilder=new e.DependencyBuilder(this._getConfigParser())),this._dependencyBuilder},_getValueGlobalNS:function(e){for(var t=e.split("."),n=(0,eval)("this")[t[0]],o=1;n&&o<t.length;o++){if(!Object.prototype.hasOwnProperty.call(n,t[o]))return null;n=n[t[o]]}return n},_getMissingDependencies:function(e){for(var t=this._getConfigParser(),n=t.getModules(),o=Object.create(null),r=0;r<e.length;r++)for(var i=n[e[r]],s=t.mapModule(i.dependencies),u=0;u<s.length;u++){var a=s[u],l=n[a];"exports"===a||"module"===a||l&&l.pendingImplementation||(o[a]=1)}return Object.keys(o)},_getModuleImplementations:function(e){for(var t=[],n=this._getConfigParser().getModules(),o=0;o<e.length;o++){var r=n[e[o]];t.push(r?r.implementation:void 0)}return t},_getPathResolver:function(){return this._pathResolver||(this._pathResolver=new e.PathResolver),this._pathResolver},_getURLBuilder:function(){return this._urlBuilder||(this._urlBuilder=new e.URLBuilder(this._getConfigParser())),this._urlBuilder},_filterModulesByProperty:function(e,t){var n=t;"string"==typeof t&&(n=[t]);for(var o=[],r=this._getConfigParser().getModules(),i=0;i<e.length;i++){var s=e[i],u=r[e[i]];if(u){if("exports"!==u&&"module"!==u){for(var a=0,l=0;l<n.length;l++)if(u[n[l]]){a=!0;break}a||o.push(s)}}else o.push(s)}return o},_loadModules:function(e){var t=this;return new Promise(function(n,o){var r=t._filterModulesByProperty(e,["requested","pendingImplementation"]);if(r.length){for(var i=t._getURLBuilder().build(r),s=[],u=0;u<i.length;u++)s.push(t._loadScript(i[u]));Promise.all(s).then(function(n){return t._waitForModules(e)}).then(function(e){n(e)})["catch"](function(e){o(e)})}else t._waitForModules(e).then(function(e){n(e)})["catch"](function(e){o(e)})})},_loadScript:function(e){var t=this;return new Promise(function(n,o){var r=document.createElement("script");r.src=e.url,r.onload=r.onreadystatechange=function(){this.readyState&&"complete"!==this.readyState&&"load"!==this.readyState||(r.onload=r.onreadystatechange=null,n(r),t.emit("scriptLoaded",e.modules))},r.onerror=function(){document.head.removeChild(r),o(r)},document.head.appendChild(r)})},_resolveDependencies:function(e){var t=this;return new Promise(function(n,o){try{var r=t._getDependencyBuilder().resolveDependencies(e);n(r)}catch(i){o(i)}})},_reportMismatchedAnonymousModules:function(e){var t="Mismatched anonymous define() module: "+e,n=this._config.reportMismatchedAnonymousModules;if(!n||"exception"===n)throw new Error(t);console&&console[n]&&console[n].call(console,t)},_setModuleImplementation:function(e){for(var t=this._getConfigParser().getModules(),n=0;n<e.length;n++){var o=e[n];if(!o.implementation)if(o.exports)o.pendingImplementation=o.implementation=this._getValueGlobalNS(o.exports);else{for(var r,i=[],s=this._getConfigParser(),u=0;u<o.dependencies.length;u++){var a=o.dependencies[u];if("exports"===a)r={},i.push(r);else if("module"===a)r={exports:{}},i.push(r);else{var l=t[s.mapModule(a)],c=l.implementation;i.push(c)}}var f;f="function"==typeof o.pendingImplementation?o.pendingImplementation.apply(o.pendingImplementation,i):o.pendingImplementation,f?o.implementation=f:r&&(o.implementation=r.exports||r)}}},_waitForModule:function(e){var t=this,n=t._modulesMap[e];return n||(n=t._createModulePromise(e),t._modulesMap[e]=n),n},_waitForModules:function(e){var t=this;return new Promise(function(n,o){for(var r=[],i=0;i<e.length;i++)r.push(t._waitForModule(e[i]));Promise.all(r).then(function(r){var i=t._getConfigParser().getModules(),s=function(){for(var o=[],r=0;r<e.length;r++)o.push(i[e[r]]);t._setModuleImplementation(o),n(o)},u=t._getMissingDependencies(e);u.length?t.require(u,s,o):s()},o)})}};return Object.keys(n).forEach(function(e){t.prototype[e]=n[e]}),t.prototype.define.amd={},t});var namespace=null,exposeGlobal=!0;if("object"==typeof global.__CONFIG__&&("string"==typeof global.__CONFIG__.namespace&&(namespace=global.__CONFIG__.namespace),"boolean"==typeof global.__CONFIG__.exposeGlobal&&(exposeGlobal=global.__CONFIG__.exposeGlobal)),namespace){var ns=window[global.__CONFIG__.namespace]?window[global.__CONFIG__.namespace]:{};ns.Loader=global.Loader,window[global.__CONFIG__.namespace]=ns}else window.Loader=global.Loader;exposeGlobal&&(window.Loader=global.Loader,window.require=global.require,window.define=global.define)}();