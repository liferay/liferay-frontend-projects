import core from 'metal';
import JSXComponent from 'metal-jsx';

export default class AppComponent extends JSXComponent {
	render() {
        return (
            <div>
				<div>
					<span class="tag">Portlet Namespace:</span> 
					<span class="value">{this.props.portletNamespace}</span>
				</div>

				<div>
					<span class="tag">Context Path:</span> 
					<span class="value">{this.props.contextPath}</span>
				</div>

				<div>
					<span class="tag">Portlet Element Id:</span>
					<span class="value">{this.props.portletElementId}</span>
				</div>
			</div>
        );
    }
}

AppComponent.PROPS = {
    portletNamespace: {
        validator: core.isString,
        value: '(unknown portletNamespace)'
    },
	contextPath: {
        validator: core.isString,
        value: '(unknown contextPath)'
    },
	portletElementId: {
		validator: core.isString,
        value: '(unknown portletElementId)'
	}
};