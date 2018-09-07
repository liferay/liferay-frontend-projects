import React from 'react';
import ReactDOM from 'react-dom';

import AppComponent from './AppComponent';

/**
 * This is the main entry point of the portlet. It receives a hash of values
 * describing the context of execution. The values are:
 *
 *   - portletElementId:
 *   		The id of the DOM node which acts as a container for the portlet.
 *   		Usually you will want to attach any generated HTML code to this
 * 			node.
 *
 *   - portletNamespace:
 *   		Portlet namespace, which is the unique identifier for this portlet
 *   		instance.
 *
 *   - contextPath:
 *   		The absolute path portion to this module's resources. It starts with
 *   		'/' and doesn't contain the protocol, host, port or authentication
 *   		values. Just the path.
 *
 * @param  {Object} params a hash with values of interest to the portlet
 * @return {void}
 */
export default function main({portletNamespace, contextPath, portletElementId}) {
    ReactDOM.render(
        <AppComponent 
            portletNamespace={portletNamespace} 
            contextPath={contextPath}
            portletElementId={portletElementId}
        />, 
        document.getElementById(portletElementId)
    );
}