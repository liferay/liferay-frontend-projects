'use strict';

import { Disposable } from 'metal';

/**
 * A cached reference to the create function.
 */
var create = Object.create;

/**
 * Case insensitive string Multimap implementation. Allows multiple values for
 * the same key name.
 * @extends {Disposable}
 */
class MultiMap extends Disposable {
	constructor() {
		super();
		this.keys = create(null);
		this.values = create(null);
	}

	/**
	 * Adds value to a key name.
	 * @param {string} name
	 * @param {*} value
	 * @chainable
	 */
	add(name, value) {
		this.keys[name.toLowerCase()] = name;
		this.values[name.toLowerCase()] = this.values[name.toLowerCase()] || [];
		this.values[name.toLowerCase()].push(value);
		return this;
	}

	/**
	 * Clears map names and values.
	 * @chainable
	 */
	clear() {
		this.keys = create(null);
		this.values = create(null);
		return this;
	}

	/**
	 * Checks if map contains a value to the key name.
	 * @param {string} name
	 * @return {boolean}
	 * @chainable
	 */
	contains(name) {
		return name.toLowerCase() in this.values;
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		this.values = null;
	}

	/**
	 * Creates a `MultiMap` instance from the given object.
	 * @param {!Object} obj
	 * @return {!MultiMap}
	 */
	static fromObject(obj) {
		var map = new MultiMap();
		var keys = Object.keys(obj);
		for (var i = 0; i < keys.length; i++) {
			map.set(keys[i], obj[keys[i]]);
		}
		return map;
	}

	/**
	 * Gets the first added value from a key name.
	 * @param {string} name
	 * @return {*}
	 * @chainable
	 */
	get(name) {
		var values = this.values[name.toLowerCase()];
		if (values) {
			return values[0];
		}
	}

	/**
	 * Gets all values from a key name.
	 * @param {string} name
	 * @return {Array.<*>}
	 */
	getAll(name) {
		return this.values[name.toLowerCase()];
	}

	/**
	 * Returns true if the map is empty, false otherwise.
	 * @return {boolean}
	 */
	isEmpty() {
		return this.size() === 0;
	}

	/**
	 * Gets array of key names.
	 * @return {Array.<string>}
	 */
	names() {
		return Object.keys(this.values).map((key) => this.keys[key]);
	}

	/**
	 * Removes all values from a key name.
	 * @param {string} name
	 * @chainable
	 */
	remove(name) {
		delete this.keys[name.toLowerCase()];
		delete this.values[name.toLowerCase()];
		return this;
	}

	/**
	 * Sets the value of a key name. Relevant to replace the current values with
	 * a new one.
	 * @param {string} name
	 * @param {*} value
	 * @chainable
	 */
	set(name, value) {
		this.keys[name.toLowerCase()] = name;
		this.values[name.toLowerCase()] = [value];
		return this;
	}

	/**
	 * Gets the size of the map key names.
	 * @return {number}
	 */
	size() {
		return this.names().length;
	}

	/**
	 * Returns the parsed values as a string.
	 * @return {string}
	 */
	toString() {
		return JSON.stringify(this.values);
	}
}

export default MultiMap;
