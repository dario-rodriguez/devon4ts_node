import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readFile } from 'fs/promises';
import { join } from 'path';

describe('Application Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', join(__dirname, '../../../src/collection.json'));
  const defaultOptions: Record<string, any> = {
    name: 'project',
  };

  it('should generate all NestJS and devon4node files', async () => {
    const tree = await runner.runSchematic('application', defaultOptions);
    const files: string[] = tree.files;

    expect(files).toEqual([
      '/project/.prettierrc',
      '/project/README.md',
      '/project/nest-cli.json',
      '/project/package.json',
      '/project/tsconfig.build.json',
      '/project/tsconfig.json',
      '/project/.eslintrc.js',
      '/project/src/main.ts',
      '/project/src/app/app.controller.spec.ts',
      '/project/src/app/app.controller.ts',
      '/project/src/app/app.module.ts',
      '/project/src/app/app.service.ts',
      '/project/src/app/core/core.module.ts',
      '/project/src/app/shared/exceptions/entity-not-found.exception.ts',
      '/project/src/app/shared/filters/entity-not-found.filter.ts',
      '/project/src/app/shared/logger/winston.logger.ts',
      '/project/test/app.e2e-spec.ts',
      '/project/test/jest-e2e.json',
      '/project/.husky/.gitignore',
      '/project/.husky/pre-commit',
      '/project/.vscode/extensions.json',
      '/project/.vscode/settings.json',
    ]);
  });

  it('should dasherize the application name', async () => {
    const options: Record<string, any> = {
      name: 'dasherizeProject',
    };
    const tree = await runner.runSchematic('application', options);
    const files: string[] = tree.files;

    expect(
      files.map(elem => elem.startsWith('/dasherize-project/')).reduce((prev, curr) => prev && curr, true),
    ).toBeTruthy();
  });

  it('should override .prettierrc content', async () => {
    const content = await readFile(join(__dirname, '../../../src/lib/devon4node-application/files/.prettierrc')).then(
      buffer => buffer.toString(),
    );
    const tree = await runner.runSchematic('application', defaultOptions);

    expect(tree.readContent('/project/.prettierrc').trimEnd()).toStrictEqual(content.trimEnd());
  });

  it('should add CoreModule to AppModule imports', async () => {
    const tree = await runner.runSchematic('application', defaultOptions);
    const appModuleContent = tree.readContent('/project/src/app/app.module.ts');

    expect(appModuleContent).toContain("import { CoreModule } from './core/core.module'");
    expect(appModuleContent).toMatch(/[.\n]*imports: \[.*CoreModule.*\][.\n]*/);
  });

  it('should update main.ts to add versioning, logger and validation pipe', async () => {
    const tree = await runner.runSchematic('application', defaultOptions);
    const appModuleContent = tree.readContent('/project/src/main.ts');

    expect(appModuleContent).toContain("import { WinstonLogger } from './app/shared/logger/winston.logger'");
    expect(appModuleContent).toContain(
      "import { EntityNotFoundFilter } from './app/shared/filters/entity-not-found.filter'",
    );
    expect(appModuleContent).toMatch(
      /[.\n]*import {.*(ValidationPipe|VersioningType).*(ValidationPipe|VersioningType).*} from '@nestjs\/common';[.\n]*/,
    );
    expect(appModuleContent).toContain('app.enableVersioning');
    expect(appModuleContent).toContain(`NestFactory.create(AppModule, { bufferLogs: true });

  const logger = await app.resolve(WinstonLogger);
  app.useLogger(logger);`);
    expect(appModuleContent).toContain(`app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        excludeExtraneousValues: true,
      },
    }),
  );
  app.useGlobalFilters(new EntityNotFoundFilter(logger));`);
  });
});
