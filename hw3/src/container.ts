import 'reflect-metadata';
import {getInjectedTokens} from './decorators/inject.js';
import {getScope, isInjectable} from './decorators/injectable.js';
import type {Constructor, Token} from './tokens.js';

type Provider =
  | {kind: 'class'; useClass: Constructor}
  | {kind: 'value'; value: unknown};

export class Container {
  private readonly providers = new Map<Token, Provider>();
  private readonly singletons = new Map<Token, unknown>();

  registerClass<T>(token: Token<T>, useClass: Constructor<T>): void {
    this.providers.set(token, {kind: 'class', useClass});
  }

  registerValue<T>(token: Token<T>, value: T): void {
    this.providers.set(token, {kind: 'value', value});
    this.singletons.set(token, value);
  }

  resolve<T>(token: Token<T>, path: Token[] = []): T {
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    const provider = this.providers.get(token) ?? this.defaultProvider(token);
    if (provider.kind === 'value') {
      return provider.value as T;
    }

    const {useClass} = provider;
    const cycleIndex = path.indexOf(token);
    if (cycleIndex !== -1) {
      const cycle = [...path.slice(cycleIndex), token]
        .map((item) => this.tokenName(item))
        .join(' -> ');
      throw new Error(`Circular dependency detected: ${cycle}`);
    }

    if (!isInjectable(useClass)) {
      throw new Error(`${useClass.name} is not marked with @Injectable()`);
    }

    const paramTypes = (Reflect.getMetadata('design:paramtypes', useClass) ?? []) as Constructor[];
    const injectedTokens = getInjectedTokens(useClass);
    const nextPath = [...path, token];
    const args = paramTypes.map((paramType, index) => {
      const dependencyToken = injectedTokens.get(index) ?? paramType;
      return this.resolve(dependencyToken, nextPath);
    });
    const instance = new useClass(...args);

    if (getScope(useClass) === 'singleton') {
      this.singletons.set(token, instance);
    }

    return instance as T;
  }

  private defaultProvider<T>(token: Token<T>): Provider {
    if (typeof token !== 'function') {
      throw new Error(`No provider registered for token ${this.tokenName(token)}`);
    }
    return {kind: 'class', useClass: token};
  }

  private tokenName(token: Token): string {
    return typeof token === 'function' ? token.name : String(token);
  }
}
