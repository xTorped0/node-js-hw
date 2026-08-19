# Mini-Nest IoC Container

A small TypeScript IoC container that resolves constructor dependencies from runtime metadata.

## Run

```bash
npm install
npm test
npm run build
```

Run the same tests in Docker:

```bash
docker compose run --rm api npm test
```

## How it works

TypeScript emits the `design:paramtypes` metadata when `experimentalDecorators` and `emitDecoratorMetadata` are enabled. The `@Injectable()` decorator marks a class as container-managed and stores its scope. During `resolve`, the container reads `Reflect.getMetadata('design:paramtypes', Target)`, recursively resolves each constructor parameter, and creates the class. Interfaces disappear at runtime and are emitted as `Object`, so `@Inject(token)` stores an explicit Symbol or string token for those dependencies. Without `emitDecoratorMetadata`, constructor types are not emitted and the container cannot discover the dependency graph automatically.

The default scope is `singleton`; `@Injectable({ scope: 'transient' })` creates a fresh instance on every resolve. The resolve path is passed through recursion so cycles report the complete chain instead of overflowing the call stack.
