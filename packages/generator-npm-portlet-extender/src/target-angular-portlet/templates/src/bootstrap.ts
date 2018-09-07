import './polyfills';
import Liferay from './types/Liferay'
import LiferayParams from './types/LiferayParams'

declare var Liferay: Liferay;

/**
 * This is the first entry point of the portlet. It just implements a launcher
 * that triggers an asynchronous load of the main module.
 * 
 * @param  {LiferayParams} params an object with values of interest to the 
 * 									portlet
 */
export default function(params: LiferayParams) {
	Liferay.Loader.require('$$BOOTSTRAP_MODULE$$', (main: any) => {
		main.default(params);
	});
}
