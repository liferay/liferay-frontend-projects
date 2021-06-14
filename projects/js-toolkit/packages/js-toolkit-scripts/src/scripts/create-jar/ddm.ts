/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	ConfigurationJsonField,
	ConfigurationJsonPortletInstance,
	Project,
} from '@liferay/js-toolkit-core';

interface Field {
	dataType: string;
	label: LocalizedValue;
	name: string;
	options: FieldOption[];
	predefinedValue: LocalizedValue;
	repeatable: boolean;
	required: boolean;
	tip: LocalizedValue;
	type: string;
}

interface FieldOption {
	value: string;
	label: LocalizedValue;
}

interface LocalizedValue {
	[locale: string]: string;
}

/**
 * Transform a preferences.json file into a DDM form JSON definition
 * @param project the project descriptor
 * @param preferencesJson a preferences JSON object
 * @return a DDM form JSON object
 */
export function transformPreferences(
	project: Project,
	preferencesJson: ConfigurationJsonPortletInstance
): object {
	return {
		availableLanguageIds: project.l10n.availableLocales || [],
		fields: Object.entries(preferencesJson.fields).map(([name, props]) => {
			const field: Field = {
				label: localized(project, props.name || name),
				name,
				...getTypeProps(props),
			} as Field;

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
						label: localized(project, value),
						value: key,
					});
				});
			}

			return field;
		}),
	};
}

/**
 * Get a predefinedValue DDM object for a given field
 * @param project the project descriptor
 * @param props the field props (in preferences.json format)
 * @return the predefinedValue DDM object
 */
function getPredefinedValue(
	project: Project,
	props: ConfigurationJsonField
): LocalizedValue {
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
 * @param props the field props (in preferences.json format)
 * @return an object containing the dataType and type properties
 */
function getTypeProps(
	props: ConfigurationJsonField
): {dataType: string; type: string} {
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
				dataType: 'number',
				type: 'ddm-number',
			};

		case 'float':
			return {
				dataType: 'double',
				type: 'ddm-decimal',
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
 * @param project the project descriptor
 * @param string the string to localize
 * @return the DDM localized value
 */
function localized(project: Project, string: string): LocalizedValue {
	if (!project.l10n.supported) {
		return {'': string};
	}

	const object = {};

	let labels = project.l10n.getLabels();

	object[''] = labels[string];

	project.l10n.availableLocales.forEach((locale) => {
		labels = project.l10n.getLabels(locale);

		object[locale] = labels[string];
	});

	return object;
}
