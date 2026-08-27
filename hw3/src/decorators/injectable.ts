import 'reflect-metadata';

export type Scope = 'singleton' | 'transient';

export interface InjectableOptions {
  scope?: Scope;
}

export const INJECTABLE_METADATA = Symbol('mini-nest:injectable');
export const SCOPE_METADATA = Symbol('mini-nest:scope');

export function Injectable(options: InjectableOptions = {}): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(INJECTABLE_METADATA, true, target);
    Reflect.defineMetadata(SCOPE_METADATA, options.scope ?? 'singleton', target);
  };
}

export function isInjectable(target: Function): boolean {
  return Reflect.getMetadata(INJECTABLE_METADATA, target) === true;
}

export function getScope(target: Function): Scope {
  return Reflect.getMetadata(SCOPE_METADATA, target) ?? 'singleton';
}
