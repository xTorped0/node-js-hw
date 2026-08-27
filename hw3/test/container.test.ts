import 'reflect-metadata';
import assert from 'node:assert/strict';
import test from 'node:test';
import {Container} from '../src/container.js';
import {Inject} from '../src/decorators/inject.js';
import {Injectable} from '../src/decorators/injectable.js';
import {CONFIG_TOKEN} from '../src/tokens.js';

type TestConfig = {environment: string};

@Injectable()
class Logger {
  readonly id = Symbol('logger');
}

@Injectable()
class ConfigConsumer {
  constructor(public readonly logger: Logger) {}
}

@Injectable()
class Repository {
  constructor(public readonly logger: Logger) {}
}

@Injectable()
class Service {
  constructor(public readonly repository: Repository) {}
}

test('resolves a recursive dependency graph from design:paramtypes', () => {
  const service = new Container().resolve(Service);
  assert.ok(service.repository.logger instanceof Logger);
});

test('singleton is reused by default', () => {
  const container = new Container();
  assert.strictEqual(container.resolve(Logger), container.resolve(Logger));
});

@Injectable({scope: 'transient'})
class RequestId {}

test('transient creates a new instance for each resolve', () => {
  const container = new Container();
  assert.notStrictEqual(container.resolve(RequestId), container.resolve(RequestId));
});

test('@Inject resolves a value by an explicit token', () => {
  const config: TestConfig = {environment: 'test'};
  const container = new Container();
  container.registerValue(CONFIG_TOKEN, config);

  @Injectable()
  class UsesConfig {
    constructor(@Inject(CONFIG_TOKEN) public readonly config: TestConfig) {}
  }

  assert.strictEqual(container.resolve(UsesConfig).config, config);
});

@Injectable()
class CycleA {
  constructor(public readonly dependency: object) {}
}

@Injectable()
class CycleB {
  constructor(public readonly dependency: CycleA) {}
}

Reflect.defineMetadata('design:paramtypes', [CycleB], CycleA);

test('reports the complete circular dependency path', () => {
  assert.throws(
    () => new Container().resolve(CycleA),
    (error: unknown) =>
      error instanceof Error &&
      !(error instanceof RangeError) &&
      error.message.includes('CycleA -> CycleB -> CycleA'),
  );
});

test('missing string providers produce a useful error', () => {
  assert.throws(
    () => new Container().resolve('MISSING'),
    /No provider registered for token MISSING/,
  );
});
