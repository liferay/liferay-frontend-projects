/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Transform a preferences.json file into a DDM form JSON definition
 * @param {Project} project the project descriptor
 * @param {object} preferencesJson a preferences JSON object
 * @return {object} a DDM form JSON object
 */
export function transformPreferences(project, preferencesJson) {
	return {
		availableLanguageIds: project.l10n.availableLocales || [],
		fields: Object.entries(preferencesJson.fields).map(([name, props]) => {
			const field = {
				name,
				label: localized(project, props.name || name),
			};

			Object.assign(field, getTypeProps(props));

			if (props.description) {
				field.tip = localized(project, props.description);
			}

			if (props.default) {
				field.predefinedValue = getPredefinedValue(project, props);
			}

			if (props.required !== undefined) {
				field.required = props.required;
			}

			if (props.repeatable !== undefined) {
				field.repeatable = props.repeatable;
			}

			if (props.options) {
				field.options = [];

				Object.entries(props.options).forEach(([key, value]) => {
					field.options.push({
						value: key,
						label: localized(project, value),
					});
				});
			}

			return field;
		}),
	};
}

/**
 * Get a predefinedValue DDM object for a given field
 * @param {Project} project the project descriptor
 * @param {object} props the field props (in preferences.json format)
 * @return {*} the predefinedValue DDM object
 */
function getPredefinedValue(project, props) {
	if (props.options) {

		// DDM uses JSON inside a JSON, so we do this to make sure this code is
		// maintenable and doesn't break anything

		let json = JSON.stringify({value: [props.default]}, null, 0);

		json = json.replace(/{"value":(.*)}/, '$1');

		return {'': json};
	}

	switch (props.type) {
		case 'string':
			return localized(project, props.default);

		case 'number':
		case 'float':
		case 'boolean':
			return {'': props.default};

		case 'password':
			throw new Error('Password fields are not supported in preferences');

		default:
			throw new Error(`Unknown field type: ${props.type}`);
	}
}

/**
 * Get the dataType and type DDM properties of a given field
 * @param {object} props the field props (in preferences.json format)
 * @return {object} an object containing the dataType and type properties
 */
function getTypeProps(props) {
	if (props.options) {
		return {
			dataType: 'string',
			type: 'select',
		};
	}

	switch (props.type) {
		case 'string':
			return {
				dataType: 'string',
				type: 'text',
			};

		case 'number':
			return {
				dataType: 'integer',
				type: 'numeric',
			};

		case 'float':
			return {
				dataType: 'double',
				type: 'numeric',
			};

		case 'boolean':
			return {
				dataType: 'boolean',
				type: 'checkbox',
			};

		case 'password':
			throw new Error('Password fields are not supported in preferences');

		default:
			throw new Error(`Unknown field type: ${props.type}`);
	}
}

/**
 * Transform a string into a localized DDM value (the string is used as the
 * default locale value)
 * @param {Project} project the project descriptor
 * @param {string} string the string to localize
 * @return {object} the DDM localized value
 */
function localized(project, string) {
	if (!project.l10n.supported) {
		return {'': string};
	}

	const obj = {};

	let labels = project.l10n.getLabels();

	obj[''] = labels[string] || string;

	project.l10n.availableLocales.forEach((locale) => {
		labels = project.l10n.getLabels(locale);

		obj[locale] = labels[string];
	});

	return obj;
}
