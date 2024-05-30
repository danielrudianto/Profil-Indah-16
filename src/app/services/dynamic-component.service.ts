import {
  Injectable,
  ComponentFactoryResolver,
  ApplicationRef,
  Injector,
  EmbeddedViewRef,
  ComponentRef,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DynamicComponentService {
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  private componentRef: ComponentRef<any> | undefined;
  private output = new Subject<any>();

  createDynamicComponent(component: any, data: any) {
    this.output = new Subject<any>();
    const componentFactory =
      this.componentFactoryResolver.resolveComponentFactory(component);
    const componentRef = componentFactory.create(this.injector);
    (componentRef.instance as any).data = data;

    this.appRef.attachView(componentRef.hostView);

    const domElement = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    document.body.appendChild(domElement);

    this.componentRef = componentRef;
    return this.output;
  }

  closeDynamicComponent(data?: any) {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = undefined;

      this.output.next(data);
      this.output.complete();
    }
  }

  get currentDynamicComponent() {
    return this.componentRef;
  }

  set view(componentRef: ComponentRef<any>) {
    this.componentRef = componentRef;
  }
}
