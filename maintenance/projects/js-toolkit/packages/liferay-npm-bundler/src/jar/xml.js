/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {js2xml, xml2js} from 'xml-js';

const TYPES = {
	boolean: 'Boolean',
	float: 'Double',
	number: 'Integer',
	password: 'Password',
	string: 'String',
};

/**
 * Add a metatype AD node to the XML
 * @param {object} metatype
 * @param {string} id id of field
 * @param {object} desc an object with type, name, description, required,
 * 			default, min, max and options fields
 */
export function addMetatypeAttr(metatype, id, desc) {
	const metadata = findChild(metatype, 'metatype:MetaData');
	const ocd = findChild(metadata, 'OCD');
	const ad = addChild(ocd, 'AD');

	addAttr(ad, 'id', id);
	addAttr(ad, 'type', TYPES[desc.type]);
	addAttr(ad, 'name', desc.name || id);
	if (desc.description !== undefined) {
		addAttr(ad, 'description', desc.description);
	}
	addAttr(ad, 'cardinality', desc.repeatable ? -32767 : 0);
	if (desc.required !== undefined) {
		addAttr(ad, 'required', desc.required);
	}
	if (desc.default !== undefined) {
		addAttr(ad, 'default', desc.default);
	}
	if (desc.options) {
		Object.entries(desc.options).forEach(([value, label]) => {
			const option = addChild(ad, 'Option');

			addAttr(option, 'label', label);
			addAttr(option, 'value', value);
		});
	}
}

/**
 *
 * @param {object} xml
 * @param {string} localization
 */
export function addMetatypeLocalization(xml, localization) {
	const metadata = findChild(xml, 'metatype:MetaData');

	addAttr(metadata, 'localization', localization);
}

/**
 * @param {string} id id of configuration
 * @param {string} name human readable name of configuration
 * @return {object}
 */
export function createMetatype(id, name) {
	return xml2js(`<?xml version="1.0" encoding="UTF-8"?>
<metatype:MetaData xmlns:metatype="http://www.osgi.org/xmlns/metatype/v1.1.0">
	<OCD name="${name}" id="${id}"/>
	<Designate pid="${id}">
		<Object ocdref="${id}"/>
	</Designate>
</metatype:MetaData>`);
}

/**
 * Format an XML object and return it as a string.
 * @param {object} xml
 * @return {string}
 */
export function format(xml) {
	return js2xml(xml, {spaces: 2});
}

/**
 * Add an attribute to an XML node.
 * @param {object} node
 * @param {string} name
 * @param {string} value
 */
function addAttr(node, name, value) {
	node.attributes = node.attributes || {};
	node.attributes[name] = value;
}

/**
 * Add a child node to an existing node.
 * @param {object} parentNode
 * @param {string} childName
 * @return {object} the child node
 */
function addChild(parentNode, childName) {
	const childNode = {
		type: 'element',
		name: childName,
		attributes: {},
		elements: [],
	};

	parentNode.elements = parentNode.elements || [];
	parentNode.elements.push(childNode);

	return childNode;
}

/**
 * Find an XML child node creating it if necessary.
 * @param {object} parentNode
 * @param {string} childName
 * @param {boolean} create
 * @return {object} the child node
 */
function findChild(parentNode, childName, create = false) {
	const elements = parentNode.elements || [];

	let childNode = elements.find((node) => node.name === childName);

	if (childNode === undefined && create) {
		childNode = {
			type: 'element',
			name: childName,
			attributes: {},
			elements: [],
		};

		parentNode.elements = elements;
		parentNode.elements.push(childNode);
	}

	return childNode;
}
