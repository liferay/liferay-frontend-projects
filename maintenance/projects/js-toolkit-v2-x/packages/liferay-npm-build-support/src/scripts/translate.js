/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import project from 'liferay-npm-build-tools-common/lib/project';
import properties from 'properties';
import request from 'request';
import uuidv4 from 'uuid/v4';

import * as cfg from '../config';

/**
 * Default entry point
 */
export default function () {
	if (!project.l10n.supported) {
		console.log(
			'Project does not support localization: nothing to translate.\n\n'
		);

		process.exit(3);
	}

	let subscriptionKey = process.env.TRANSLATOR_TEXT_KEY;

	if (!subscriptionKey) {
		subscriptionKey = cfg.getTranslatorTextKey();
	}

	if (!subscriptionKey) {
		console.error(
			'-------------------------------------------------------------\n' +
				'    🛑 Microsoft Translator credentials not set 🛑\n\n' +
				'Please set the translatorTextKey variable in your .npmbuildrc\n' +
				'file or provide them in the TRANSLATOR_TEXT_KEY environment\n' +
				'variable.\n' +
				'-------------------------------------------------------------\n'
		);

		process.exit(2);
	}

	showMissingSupportedLocales();

	createMissingSupportedLocalesFiles();

	const localizationFileMap = project.l10n.localizationFileMap;

	const locales = Object.keys(localizationFileMap).filter(
		(locale) => locale !== 'default'
	);

	if (!locales.length) {
		console.log(
			'No locales found: nothing to translate.\n\n' +
				'You can edit your .npmbuildrc file to add new supported ' +
				"locales using the 'supportedLocales' array.\n"
		);

		return;
	}

	console.log(`\nFound ${locales.length} locales: ${locales.join(', ')}\n`);

	console.log('Adding missing translations:');

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
			console.log('\nWriting localization files:');

			Object.entries(labels).forEach(([locale, labels]) => {
				fs.writeFileSync(
					localizationFileMap[locale].asNative,
					properties.stringify(labels)
				);
				console.log(
					`  · Wrote ${localizationFileMap[locale].asNative}`
				);
			});

			console.log('\nFinished\n');
		})
		.catch((err) => {
			console.error(
				'\nThere was an error translating files:\n\n' + ' ',
				err,
				'\n'
			);
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
export function addMissingTranslations(translation, labels) {
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

		console.log(
			count === 0
				? `  · No missing translations found for locale ${locale}`
				: `  · Added ${count} missing translations for locale ${locale}`
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
export function arrayToMap(array, keys) {
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
export function createTranslationsObject(locales) {
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
export function flattenResponses(responses) {
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
export function makeChunks(texts) {
	const chunks = [];
	let currentChunk;
	let chars;

	// A helper to add a new chunk to the `chunks` array

	function appendChunk() {
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
function showMissingSupportedLocales() {
	const availableLocales = project.l10n.availableLocales;

	const supportedLocales = cfg.getSupportedLocales();

	const missingLocales = availableLocales.filter(
		(locale) => supportedLocales.indexOf(locale) === -1
	);

	if (missingLocales.length) {
		console.log(`Found ${missingLocales.length} unsupported locale files:`);

		missingLocales.forEach((locale) =>
			console.log(`  · Found file for unsupported locale ${locale}`)
		);

		console.log(
			'\n  You can edit your .npmbuildrc file to add these unsupported \n' +
				'  locales or remove their .properties files to hide this warning.'
		);
	}
}

/**
 * Creates missing locale files according to .npmbuildrc configuration
 */
function createMissingSupportedLocalesFiles() {
	const supportedLocales = cfg.getSupportedLocales();

	const missingLocales = supportedLocales.filter(
		(locale) => project.l10n.availableLocales.indexOf(locale) === -1
	);

	if (missingLocales.length) {
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
function parseFile(filePath) {
	return new Promise((resolve, reject) => {
		properties.parse(filePath, {path: true}, (err, labels) => {
			if (err) {
				reject(err);
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
function translate(subscriptionKey, locales, texts) {

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
		method: 'POST',
		baseUrl: 'https://api.cognitive.microsofttranslator.com/',
		url: 'translate',
		qs: {
			'api-version': '3.0',
			'to': targetLocales,
		},
		headers: {
			'Ocp-Apim-Subscription-Key': subscriptionKey,
			'Content-type': 'application/json',
			'X-ClientTraceId': uuidv4().toString(),
		},
		json: true,
	};

	const promises = makeChunks(texts).map(
		(chunk) =>
			new Promise((resolve, reject) => {
				request(
					{
						...options,
						body: chunk.map((item) => ({text: item})),
					},
					(err, response, body) => {
						if (err) {
							reject(err);
						}
						else if (response.statusCode !== 200) {
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
			response.translations.forEach((translation) => {
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
function translateFile(subscriptionKey, locales, filePath) {
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
