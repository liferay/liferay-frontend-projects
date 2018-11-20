import {js2xml, xml2js} from 'xml-js';

/**
 * Patch a parsed metatype XML file to add pids, localization, etc.
 * @param {string} xml
 * @param {string} localization path of localization file
 * @param {string} pid configuration ID
 * @return {string} the patched XML
 */
export function patchMetatypeXml(xml, {localization, pid}) {
	const js = xml2js(xml, {});

	const metadata = findChild(js, 'metatype:MetaData');

	if (localization) {
		metadata.attributes['localization'] = localization;
	}

	const ocd = findChild(metadata, 'OCD');

	addAttr(ocd, 'id', pid);

	const designate = findChild(metadata, 'Designate', true);

	addAttr(designate, 'pid', pid);

	const object = findChild(designate, 'Object', true);

	addAttr(object, 'ocdref', pid);

	return js2xml(js, {spaces: 2});
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
 * Find an XML child node creating it if necessary.
 * @param {object} parentNode
 * @param {string} childName
 * @param {boolean} create
 * @return {object} the child node
 */
function findChild(parentNode, childName, create = false) {
	let childNode = parentNode.elements.find(node => node.name == childName);

	if (childNode === undefined && create) {
		childNode = {
			type: 'element',
			name: childName,
			attributes: {},
			elements: [],
		};

		parentNode.elements.push(childNode);
	}

	return childNode;
}
