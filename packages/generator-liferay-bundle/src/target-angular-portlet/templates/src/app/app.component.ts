import { Component } from '@angular/core';

import LiferayParams from '../types/LiferayParams'

@Component({
	templateUrl: '/o/<%= pkgJson.name %>/app/app.component.html'
})
export class AppComponent {
	params: LiferayParams;
}
