/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {ConfigurationJsonField} from '@liferay/js-toolkit-core';
import {Element, ElementCompact, js2xml, xml2js} from 'xml-js';

type XmlObject = Element | ElementCompact;

const TYPES = {
	boolean: 'Boolean',
	float: 'Double',
	number: 'Integer',
	password: 'Password',
	string: 'String',
};

/**
 * Add a metatype AD node to the XML
 */
export function addMetatypeAttr(
	metatype: XmlObject,
	id: string,
	field: ConfigurationJsonField
): void {
	const metadata = findChild(metatype, 'metatype:MetaData');
	const ocd = findChild(metadata, 'OCD');
	const ad = addChild(ocd, 'AD');

	addAttr(ad, 'id', id);
	addAttr(ad, 'type', TYPES[field.type]);
	addAttr(ad, 'name', field.name || id);
	if (field.description !== undefined) {
		addAttr(ad, 'description', field.description);
	}
	addAttr(ad, 'cardinality', field.repeatable ? -32767 : 0);
	if (field.required !== undefined) {
		addAttr(ad, 'required', field.required);
	}
	if (field.default !== undefined) {
		addAttr(ad, 'default', field.default);
	}
	if (field.options) {
		Object.entries(field.options).forEach(([value, label]) => {
			const option = addChild(ad, 'Option');

			addAttr(option, 'label', label);
			addAttr(option, 'value', value);
		});
	}
}

export function addMetatypeLocalization(
	xml: XmlObject,
	localization: string
): void {
	const metadata = findChild(xml, 'metatype:MetaData');

	addAttr(metadata, 'localization', localization);
}

/**
 * @param id id of configuration
 * @param name human readable name of configuration
 */
export function createMetatype(id: string, name: string): XmlObject {
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
 */
export function format(xml: XmlObject): string {
	return js2xml(xml, {spaces: 2});
}

/**
 * Add an attribute to an XML node.
 */
function addAttr(
	node: XmlObject,
	name: string,
	value: string | boolean | number
): void {
	node.attributes = node.attributes || {};
	node.attributes[name] = value;
}

/**
 * Add a child node to an existing node.
 */
function addChild(parentNode: XmlObject, childName: string): XmlObject {
	const childNode = {
		attributes: {},
		elements: [],
		name: childName,
		type: 'element',
	};

	parentNode.elements = parentNode.elements || [];
	parentNode.elements.push(childNode);

	return childNode;
}

/**
 * Find an XML child node creating it if necessary.
 */
function findChild(
	parentNode: XmlObject,
	childName: string,
	create = false
): XmlObject {
	const elements = parentNode.elements || [];

	let childNode = elements.find((node) => node.name === childName);

	if (childNode === undefined && create) {
		childNode = {
			attributes: {},
			elements: [],
			name: childName,
			type: 'element',
		};

		parentNode.elements = elements;
		parentNode.elements.push(childNode);
	}

	return childNode;
}
