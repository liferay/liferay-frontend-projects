/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import ResolvablePromise from './resolvable-promise';

/**
 * A module descriptor
 */
export default class Module {

	/**
	 * @param {string} name name of module
	 */
	constructor(name) {
		this._name = name;
		this._dependencies = undefined;
		this._factory = undefined;
		this._implementation = {};
		this._useESM = false;

		this._map = undefined;

		this._state = {
			_define: ResolvablePromise.new(),
			_fetch: ResolvablePromise.new(),
			_implement: ResolvablePromise.new(),
		};
	}

	/**
	 * Name of module
	 */
	get name() {
		return this._name;
	}

	/**
	 * Dependencies of module
	 */
	get dependencies() {
		return this._dependencies;
	}

	/**
	 * AMD factory function
	 */
	get factory() {
		return this._factory;
	}

	/**
	 * Result of factory invocation (module.exports)
	 */
	get implementation() {
		return this._implementation;
	}

	/**
	 * Local module mappings for module
	 */
	get map() {
		return this._map;
	}

	/**
	 * Flag informing that this module's implementation needs to have __esModule
	 * property defined as true even before it is implemented.
	 *
	 * This is necessary for cyclic dependencies to work for ES6+ modules.
	 */
	get esModule() {
		return this._implementation.__esModule;
	}

	/**
	 * Get the fetch promise which is fulfilled when the script containing the
	 * module definition has been loaded/failed.
	 *
	 * Note that a module may be defined even if it is not yet fetched because
	 * define() gets called while the script is being loaded.
	 * @return {ResolvablePromise}
	 */
	get fetch() {
		return this._state._fetch;
	}

	/**
	 * Shorthand for this.fetch.resolved
	 */
	get fetched() {
		return this.fetch.resolved;
	}

	/**
	 * Get the define promise which if fulfilled when the script had been
	 * registered by the AMD define() function.
	 *
	 * Note that definition does not imply implementation.
	 *
	 * Also note that a module may be defined even if it is not yet fetched
	 * because define() gets called while the script is being loaded.
	 * @return {ResolvablePromise}
	 */
	get define() {
		return this._state._define;
	}

	/**
	 * Shorthand for this.define.resolved
	 */
	get defined() {
		return this.define.resolved;
	}

	/**
	 * Get the implement promise which if fulfilled when the module has been
	 * defined and its AMD factory function has been invoked successfully.
	 */
	get implement() {
		return this._state._implement;
	}

	/**
	 * Shorthand for this.implement.resolved
	 */
	get implemented() {
		return this.implement.resolved;
	}

	/**
	 * Flag informing that this module needs to be loaded using
	 * <script type="module"> as opposed to plain <script>.
	 *
	 * This is necessary mainly for liferay-portal's ESM -> AMD bridges.
	 */
	get useESM() {
		return this._useESM;
	}

	/**
	 * Name of module
	 * @param {string} name
	 */
	set name(name) {
		throw new Error(`Name of module ${this.name} is read-only`);
	}

	/**
	 * Dependencies of module
	 * @param {Array} dependencies
	 */
	set dependencies(dependencies) {
		if (this._dependencies) {
			throw new Error(`Dependencies of module ${this.name} already set`);
		}

		this._dependencies = dependencies;
	}

	/**
	 * AMD factory function
	 * @param {function} factory
	 */
	set factory(factory) {
		if (this._factory) {
			throw new Error(`Factory of module ${this.name} already set`);
		}

		this._factory = factory;
	}

	/**
	 * Result of factory invocation (module.exports)
	 * @param {*} implementation
	 */
	set implementation(implementation) {
		this._implementation = implementation;
	}

	/**
	 * Local module mappings for module
	 * @param {object} map
	 */
	set map(map) {
		if (this._map) {
			throw new Error(
				`Local module map of module ${this.name} already set`
			);
		}

		this._map = map;
	}

	/**
	 * Flag informing that this module's implementation needs to have __esModule
	 * property defined as true even before it is implemented.
	 *
	 * This is necessary for cyclic dependencies to work for ES6+ modules.
	 *
	 * @param {boolean} esModule
	 */
	set esModule(esModule) {
		Object.defineProperty(this._implementation, '__esModule', {
			configurable: true,
			value: esModule,
			writable: true,
		});
	}

	/**
	 * Whether to load the module using <script type="module"> or plain regular
	 * <script>.
	 *
	 * @param {useESM} boolean
	 */
	set useESM(useESM) {
		this._useESM = useESM;
	}
}
