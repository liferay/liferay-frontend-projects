/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from '@liferay/js-toolkit-core';
import fs from 'fs';
import properties from 'properties';
import request from 'request';
import uuidv4 from 'uuid/v4';

import {getSupportedLocales, getTranslatorTextKey, project} from '../config';

const {debug, error, info, print, success, warn} = format;

/**
 * Default entry point
 */
export default function (): void {
	if (!project.l10n.supported) {
		print(error`
			Project does not support localization: nothing to translate.
		`);

		process.exit(3);
	}

	let subscriptionKey = process.env.TRANSLATOR_TEXT_KEY;

	if (!subscriptionKey) {
		subscriptionKey = getTranslatorTextKey();
	}

	if (!subscriptionKey || subscriptionKey === '') {
		print(error`
			-------------------------------------------------------------
			🛑 Microsoft Translator credentials not set 🛑

			Please set the translatorTextKey variable in your .npmbuildrc
			file or provide them in the TRANSLATOR_TEXT_KEY environment
			variable.
			-------------------------------------------------------------
		`);

		process.exit(2);
	}

	showMissingSupportedLocales();

	createMissingSupportedLocalesFiles();

	const localizationFileMap = project.l10n.localizationFileMap;

	const locales = Object.keys(localizationFileMap).filter(
		(locale) => locale != 'default'
	);

	if (locales.length === 0) {
		print(error`No locales found: nothing to translate`);
		print(info`
			You can edit your .npmbuildrc file to add new supported locales
			using the 'supportedLocales' array.
		`);

		return;
	}

	print(debug`Found ${locales.length} locales: ${locales.join(', ')}`);
	print(info`Adding missing translations:`);

	Promise.all([
		translateFile(
			subscriptionKey,
			locales,
			localizationFileMap.default.asNative
		),
		...locales.map((locale) =>
			parseFile(localizationFileMap[locale].asNative)
		),
	])
		.then(([translation, ...labels]) =>
			addMissingTranslations(translation, arrayToMap(labels, locales))
		)
		.then((labels) => {
			print(debug`Writing localization files:`);

			Object.entries(labels).forEach(([locale, labels]) => {
				fs.writeFileSync(
					localizationFileMap[locale].asNative,
					properties.stringify(labels)
				);
				print(debug`  · Wrote ${localizationFileMap[locale].asNative}`);
			});

			print(success`Finished`);
		})
		.catch((translateError) => {
			print(error`
				There was an error translating files:

				  ${translateError}

			`);
			process.exit(1);
		});
}

/**
 * Adds missing translations from the translation parameter to the labels
 * parameter.
 * @param {object} translation map of label maps indexed by locale
 * @param {object} labels map of label maps indexed by locale
 * @return {object} the modified labels parameter
 */
export function addMissingTranslations(translation, labels): object {
	const locales = Object.keys(translation);

	locales.forEach((locale) => {
		const map = translation[locale];

		let count = 0;

		Object.entries(map).forEach(([key, value]) => {
			if (!labels[locale][key]) {
				labels[locale][key] = value;
				count++;
			}
		});

		print(
			count === 0
				? info`  · No missing translations found for locale ${locale}`
				: info`  · Added ${count} missing translations for locale ${locale}`
		);
	});

	return labels;
}

/**
 * Converts an array of items into a map with given keys as property names.
 * @param {Array<*>} array array of values
 * @param {Array<string>} keys array of key names
 * @return {object}
 */
export function arrayToMap(array, keys): object {
	return array.reduce(
		(map, item, index) => ((map[keys[index]] = item), map),
		{}
	);
}

/**
 *
 * @param {Array<string>} locales
 * @return {object} an object with empty arrays as properties, indexed by locale
 */
export function createTranslationsObject(locales: string[]): object {
	return locales.reduce(
		(translations, locale) => ((translations[locale] = []), translations),
		{}
	);
}

/**
 * Flatten an array or arrays
 * @param {Array<Array<object>>} responses
 * @return {Array<object>}
 */
export function flattenResponses(responses): object[] {
	return responses.reduce(
		(flatResponses, response) => (
			flatResponses.push(...response), flatResponses
		),
		[]
	);
}

/**
 * Split an array of strings into sub arrays of limited length, suitable for use
 * with Microsoft Translator API.
 * @param {Array<string>} texts
 * @return {Array<Array<string>>} split text arrays
 */
export function makeChunks(texts): string[][] {
	const chunks = [];
	let currentChunk;
	let chars;

	// A helper to add a new chunk to the `chunks` array

	function appendChunk(): void {
		chars = 0;
		currentChunk = [];
		chunks.push(currentChunk);
	}

	appendChunk();

	texts.forEach((text) => {

		// Limit total request to 5000 chars, but we need room for []
		chars += text.length + 11; // 11 is for {"Text":},<CR>
		if (chars > 4098) {
			appendChunk();
		}

		// Limit total request texts to 100

		if (currentChunk.length >= 100) {
			appendChunk();
		}

		// Register request

		currentChunk.push(text);
	});

	return chunks;
}

/**
 * Show missing supported locales: those for which there's a .properties file
 * but are not configured.
 */
function showMissingSupportedLocales(): void {
	const availableLocales = project.l10n.availableLocales;

	const supportedLocales = getSupportedLocales();

	const missingLocales = availableLocales.filter(
		(locale) => supportedLocales.indexOf(locale) === -1
	);

	if (missingLocales.length > 0) {
		print(warn`Found ${missingLocales.length} unsupported locale files:`);

		missingLocales.forEach((locale) =>
			print(warn`  · Found file for unsupported locale ${locale}`)
		);

		print(info`
			You can edit your .npmbuildrc file to add these unsupported
			locales or remove their .properties files to hide this warning.
		`);
	}
}

/**
 * Creates missing locale files according to .npmbuildrc configuration
 */
function createMissingSupportedLocalesFiles(): void {
	const supportedLocales = getSupportedLocales();

	const missingLocales = supportedLocales.filter(
		(locale) => project.l10n.availableLocales.indexOf(locale) === -1
	);

	if (missingLocales.length > 0) {
		const languageFileBaseName = project.l10n.languageFileBaseName;

		missingLocales.forEach((locale) =>
			fs.writeFileSync(
				`${languageFileBaseName.asNative}_${locale}.properties`,
				''
			)
		);
	}
}

/**
 * Parses a .properties file
 * @param {string} filePath
 * @return {Promise<object>} the map of properties
 */
function parseFile(filePath): Promise<object> {
	return new Promise((resolve, reject) => {
		properties.parse(filePath, {path: true}, (error, labels) => {
			if (error) {
				reject(error);
			}
			else {
				resolve(labels);
			}
		});
	});
}

/**
 * @param {string} subscriptionKey
 * @param {Array<string>} locales
 * @param {Array<string>} texts
 * @return {Promise<object>} a map of arrays with translated texts indexed by
 * 								locale
 */
function translate(subscriptionKey, locales, texts): Promise<object> {

	// Map from ['es_ES', 'es_AR'] to {'es_ES': 'es', 'es_AR': 'es'}

	const localesMap = locales.reduce((map, locale) => {
		const targetLocale = locale.split('_')[0];

		if (map[targetLocale] === undefined) {
			map[targetLocale] = [];
		}

		map[targetLocale].push(locale);

		return map;
	}, {});

	const targetLocales = [...new Set(Object.keys(localesMap))];

	const options = {
		baseUrl: 'https://api.cognitive.microsofttranslator.com/',
		headers: {
			'Content-type': 'application/json',
			'Ocp-Apim-Subscription-Key': subscriptionKey,
			'X-ClientTraceId': uuidv4().toString(),
		},
		json: true,
		method: 'POST',
		qs: {
			'api-version': '3.0',
			to: targetLocales,
		},
		url: 'translate',
	};

	const promises = makeChunks(texts).map(
		(chunk) =>
			new Promise((resolve, reject) => {
				request(
					{
						...options,
						body: chunk.map((item) => ({text: item})),
					},
					(error, response, body) => {
						if (error) {
							reject(error);
						}
						else if (response.statusCode != 200) {
							reject({
								code: response.statusCode,
								message: response.statusMessage,
							});
						}
						else if (body.error) {
							reject(body.error);
						}
						else {
							resolve(body);
						}
					}
				);
			})
	);

	return Promise.all(promises).then((responses) => {
		const translations = createTranslationsObject(locales);

		flattenResponses(responses).forEach((response) => {
			response['translations'].forEach((translation) => {
				localesMap[translation.to].forEach((locale) =>
					translations[locale].push(translation.text)
				);
			});
		});

		return translations;
	});
}

/**
 *
 * @param {string} subscriptionKey
 * @param {Array<string>} locales
 * @param {string} filePath
 * @return {Promise<object>} map of label maps indexed by locale
 */
function translateFile(subscriptionKey, locales, filePath): Promise<object> {
	let keys;

	return parseFile(filePath)
		.then((labels) => {
			keys = Object.keys(labels);

			return translate(
				subscriptionKey,
				locales,
				keys.map((key) => labels[key])
			);
		})
		.then((translation) => {
			locales.forEach((locale) => {
				translation[locale] = arrayToMap(translation[locale], keys);
			});

			return translation;
		});
}
