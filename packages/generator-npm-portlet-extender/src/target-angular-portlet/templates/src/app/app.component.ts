import { Component } from '@angular/core';

import LiferayParams from '../types/LiferayParams'

@Component({
	templateUrl: '$$WEB_CONTEXT_PATH$$/app/app.component.html'
})
export class AppComponent {
	params: LiferayParams;
}
