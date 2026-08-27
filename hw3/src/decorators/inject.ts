import 'reflect-metadata';
import type {Token} from '../tokens.js';

const INJECT_TOKENS_METADATA = Symbol('mini-nest:inject-tokens');

type InjectedTokens = Map<number, Token>;

export function Inject(token: Token): ParameterDecorator {
  return (target, _propertyKey, parameterIndex) => {
    const constructor = typeof target === 'function' ? target : target.constructor;
    const tokens = Reflect.getMetadata(INJECT_TOKENS_METADATA, constructor) as InjectedTokens | undefined;
    const nextTokens = tokens ?? new Map<number, Token>();
    nextTokens.set(parameterIndex, token);
    Reflect.defineMetadata(INJECT_TOKENS_METADATA, nextTokens, constructor);
  };
}

export function getInjectedTokens(target: Function): InjectedTokens {
  return Reflect.getMetadata(INJECT_TOKENS_METADATA, target) ?? new Map<number, Token>();
}
