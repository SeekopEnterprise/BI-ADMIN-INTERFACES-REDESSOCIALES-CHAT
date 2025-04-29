import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbIconLibraries } from '@nebular/theme';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class CoreModule {
  constructor(private iconLibraries: NbIconLibraries) {
    this.iconLibraries.registerSvgPack('seekop',{

      'mdl-file-eye':'<svg xmlns="http://www.w3.org/2000/svg" width="15.994" height="17.677" viewBox="0 0 15.994 17.677"><path id="mdi-file-eye" d="M14.943,15.468a.842.842,0,1,1-.842.842.834.834,0,0,1,.842-.842m0-2.525A5.425,5.425,0,0,0,9.892,16.31a5.472,5.472,0,0,0,10.1,0,5.425,5.425,0,0,0-5.051-3.367m0,5.472a2.1,2.1,0,1,1,2.1-2.1,2.1,2.1,0,0,1-2.1,2.1M8.327,16.941l-.244-.631.244-.623a7.068,7.068,0,0,1,6.616-4.428,7.231,7.231,0,0,1,2.525.471V7.051L12.418,2H5.684A1.678,1.678,0,0,0,4,3.684V17.152a1.684,1.684,0,0,0,1.684,1.684H9.472a7.779,7.779,0,0,1-1.145-1.894M11.576,3.263l4.63,4.63h-4.63Z" transform="translate(-4 -2)" fill="#fff"/></svg>'
    });
  }
}
