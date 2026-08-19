export type Constructor<T = unknown> = new (...args: any[]) => T;
export type Token<T = unknown> = Constructor<T> | string | symbol;

export const CONFIG_TOKEN = Symbol.for('CONFIG');
