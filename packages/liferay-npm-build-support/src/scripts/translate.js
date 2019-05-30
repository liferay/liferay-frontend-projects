/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import properties from 'properties';
import request from 'request';
import uuidv4 from 'uuid/v4';

import * as cfg from '../config';

/**
 * Default entry point
 */
export default function() {
	let subscriptionKey = process.env.TRANSLATOR_TEXT_KEY;

	if (!subscriptionKey) {
		subscriptionKey = cfg.getTranslatorTextKey();
	}

	if (!subscriptionKey || subscriptionKey == '') {
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

	const localizationFiles = cfg.getLocalizationFiles();

	const locales = Object.keys(localizationFiles).filter(
		locale => locale != 'default'
	);

	if (locales.length == 0) {
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
		translateFile(subscriptionKey, locales, localizationFiles.default),
		...locales.map(locale => parseFile(localizationFiles[locale])),
	])
		.then(([translation, ...labels]) =>
			addMissingTranslations(translation, arrayToMap(labels, locales))
		)
		.then(labels => {
			console.log('\nWriting localization files:');

			Object.entries(labels).forEach(([locale, labels]) => {
				fs.writeFileSync(
					localizationFiles[locale],
					properties.stringify(labels)
				);
				console.log(`  · Wrote ${localizationFiles[locale]}`);
			});

			console.log('\nFinished\n');
		})
		.catch(err => {
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

	locales.forEach(locale => {
		const map = translation[locale];

		let count = 0;

		Object.entries(map).forEach(([key, value]) => {
			if (!labels[locale][key]) {
				labels[locale][key] = value;
				count++;
			}
		});

		console.log(
			count == 0
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

	texts.forEach(text => {
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
	const localizationFiles = cfg.getLocalizationFiles();

	const locales = Object.keys(localizationFiles).filter(
		locale => locale != 'default'
	);

	const supportedLocales = cfg.getSupportedLocales();

	const missingLocales = locales.filter(
		locale => supportedLocales.indexOf(locale) == -1
	);

	if (missingLocales.length > 0) {
		console.log(`Found ${missingLocales.length} unsupported locale files:`);

		missingLocales.forEach(locale =>
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
	const localizationFiles = cfg.getLocalizationFiles();

	const locales = Object.keys(localizationFiles).filter(
		locale => locale != 'default'
	);

	const supportedLocales = cfg.getSupportedLocales();

	const missingLocales = supportedLocales.filter(
		locale => locales.indexOf(locale) == -1
	);

	if (missingLocales.length > 0) {
		const localizationFile = cfg.getLocalizationFile();

		missingLocales.forEach(locale =>
			fs.writeFileSync(`${localizationFile}_${locale}.properties`, '')
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
			} else {
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
	const options = {
		method: 'POST',
		baseUrl: 'https://api.cognitive.microsofttranslator.com/',
		url: 'translate',
		qs: {
			'api-version': '3.0',
			to: locales,
		},
		headers: {
			'Ocp-Apim-Subscription-Key': subscriptionKey,
			'Content-type': 'application/json',
			'X-ClientTraceId': uuidv4().toString(),
		},
		json: true,
	};

	const promises = makeChunks(texts).map(
		chunk =>
			new Promise((resolve, reject) => {
				request(
					Object.assign({}, options, {
						body: chunk.map(item => ({text: item})),
					}),
					(err, response, body) => {
						if (err) {
							reject(err);
						} else if (response.statusCode != 200) {
							reject({
								code: response.statusCode,
								message: response.statusMessage,
							});
						} else if (body.error) {
							reject(body.error);
						} else {
							resolve(body);
						}
					}
				);
			})
	);

	return Promise.all(promises).then(responses => {
		const translations = createTranslationsObject(locales);

		flattenResponses(responses).forEach(response => {
			response.translations.forEach(translation => {
				translations[translation.to].push(translation.text);
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
		.then(labels => {
			keys = Object.keys(labels);

			return translate(
				subscriptionKey,
				locales,
				keys.map(key => labels[key])
			);
		})
		.then(translation => {
			locales.forEach(locale => {
				translation[locale] = arrayToMap(translation[locale], keys);
			});

			return translation;
		});
}
