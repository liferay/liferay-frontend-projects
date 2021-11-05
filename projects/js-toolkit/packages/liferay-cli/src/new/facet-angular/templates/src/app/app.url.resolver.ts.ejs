import { UrlResolver } from '@angular/compiler';

import { BaseURLMap } from '../types/base.url.map';
import { LiferayParams } from '../types/liferay.params';

declare const Liferay: any;

/**
 * This is a map from `baseUrl`s to server URLs so that the Angular Compiler
 * knows the place from where templates must be downloaded
 */
const BASE_URL_MAP: BaseURLMap = {
	'./AppComponent': '/app'
};

export class AppUrlResolver implements UrlResolver {
	/* Initial LiferayParams object (injected from index.ts) */
	static params: LiferayParams;

	resolve(baseUrl: string, url: string): string {
		if (url.startsWith('.')) {
			url = url.substring(1);
		}

		if (!url.startsWith('/')) {
			url = '/' + url;
		}

		const mappedBaseUrl = BASE_URL_MAP[baseUrl];

		if (!mappedBaseUrl) {
			throw new Error(`Unknown baseUrl: ${baseUrl}`);
		}

		return Liferay.ThemeDisplay.getPathContext() + 
			AppUrlResolver.params.contextPath +
			mappedBaseUrl + 
			url;
	}
}
