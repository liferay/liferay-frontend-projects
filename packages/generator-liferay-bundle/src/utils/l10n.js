/**
 * Format label values according to different formats.
 * @param {object} labels
 * @return {object} returns an object with labels transformed according to
 * 			different formats: 'raw', 'quoted', 'template', 'js'
 */
export function formatLabels(labels) {
	return {
		raw: labels,
		quoted: Object.entries(labels).reduce((obj, [key, value]) => {
			obj[key] = `'${value}'`;
			return obj;
		}, {}),
		template: Object.keys(labels).reduce((obj, key) => {
			obj[key] = `\${Liferay.Language.get('${hyphenate(key)}')}`;
			return obj;
		}, {}),
		js: Object.keys(labels).reduce((obj, key) => {
			obj[key] = `Liferay.Language.get('${hyphenate(key)}')`;
			return obj;
		}, {}),
		jsx: Object.keys(labels).reduce((obj, key) => {
			obj[key] = `{Liferay.Language.get('${hyphenate(key)}')}`;
			return obj;
		}, {}),
		properties: Object.keys(labels).reduce((obj, key) => {
			obj[hyphenate(key)] = labels[key];
			return obj;
		}, {}),
	};
}

/**
 * Convert key from camel case to hyphens.
 * @param {string} key
 * @return {string}
 */
function hyphenate(key) {
	let ret = '';

	for (let i = 0; i < key.length; i++) {
		let char = key.charAt(i);

		if (char === char.toUpperCase()) {
			char = `-${char.toLowerCase()}`;
		}

		ret += char;
	}

	return ret;
}
