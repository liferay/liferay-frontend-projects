/**
 * Add an attribute to an XML node.
 * @param {object} node
 * @param {string} name
 * @param {string} value
 */
export function addAttr(node, name, value) {
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
export function findChild(parentNode, childName, create = false) {
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
