import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { concatMap } from 'rxjs/operators';
import { IResourceOptions } from './resource.factory';

describe('Resource Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  const defaultResourceOptions: IResourceOptions = {
    crud: false,
    name: 'tests',
    spec: true,
    type: 'rest',
  };

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('resource', { ...defaultResourceOptions }).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should generate the files at src/app if executed on root directory', done => {
    const options = { ...defaultResourceOptions };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('resource', options, tree)))
      .subscribe(tree => {
        expect(tree.exists('/src/app/tests/tests.module.ts')).toBeDefined();
        expect(tree.exists('/src/app/tests/controllers/tests.controller.spec.ts')).toBeDefined();
        expect(tree.exists('/src/app/tests/controllers/tests.controller.ts')).toBeDefined();
        expect(tree.exists('/src/app/tests/services/tests.service.spec.ts')).toBeDefined();
        expect(tree.exists('/src/app/tests/services/tests.service.ts')).toBeDefined();

        done();
      });
  });

  it('should generate a REST module', done => {
    const options = { ...defaultResourceOptions };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('resource', options, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/src/app/tests/tests.module.ts',
            '/src/app/tests/controllers/tests.controller.spec.ts',
            '/src/app/tests/controllers/tests.controller.ts',
            '/src/app/tests/services/tests.service.spec.ts',
            '/src/app/tests/services/tests.service.ts',
          ]),
        );
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.controller`);
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
        expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(
          `../services/tests.service`,
        );

        done();
      });
  });

  it('should generate a REST module with CRUD', done => {
    const options = { ...defaultResourceOptions, crud: true };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('resource', options, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/src/app/tests/tests.module.ts',
            '/src/app/tests/controllers/tests.controller.spec.ts',
            '/src/app/tests/controllers/tests.controller.ts',
            '/src/app/tests/services/tests.service.spec.ts',
            '/src/app/tests/services/tests.service.ts',
            '/src/app/tests/model/dtos/create-test.dto.ts',
            '/src/app/tests/model/dtos/update-test.dto.ts',
            '/src/app/tests/model/entities/test.entity.ts',
          ]),
        );
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.controller`);
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
        expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(
          `../services/tests.service`,
        );
        expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(
          `../model/dtos/create-test.dto`,
        );
        expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(
          `../model/dtos/update-test.dto`,
        );
        expect(tree.readContent(`/src/app/tests/services/tests.service.ts`)).toContain(`../model/dtos/create-test.dto`);
        expect(tree.readContent(`/src/app/tests/services/tests.service.ts`)).toContain(`../model/dtos/update-test.dto`);
        done();
      });
  });

  it('should generate a GraphQL code-first module', done => {
    const options = { ...defaultResourceOptions, type: 'graphql-code-first' };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('resource', options, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/src/app/tests/tests.module.ts',
            '/src/app/tests/controllers/tests.resolver.spec.ts',
            '/src/app/tests/controllers/tests.resolver.ts',
            '/src/app/tests/services/tests.service.spec.ts',
            '/src/app/tests/services/tests.service.ts',
          ]),
        );
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.resolver`);
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
        expect(tree.readContent(`/src/app/tests/controllers/tests.resolver.ts`)).toContain(`../services/tests.service`);

        done();
      });
  });

  it('should generate a GraphQL code-first module with CRUD', done => {
    const options = { ...defaultResourceOptions, crud: true, type: 'graphql-code-first' };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('resource', options, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/src/app/tests/tests.module.ts',
            '/src/app/tests/controllers/tests.resolver.spec.ts',
            '/src/app/tests/controllers/tests.resolver.ts',
            '/src/app/tests/services/tests.service.spec.ts',
            '/src/app/tests/services/tests.service.ts',
            '/src/app/tests/model/dtos/create-test.input.ts',
            '/src/app/tests/model/dtos/update-test.input.ts',
            '/src/app/tests/model/entities/test.entity.ts',
          ]),
        );
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.resolver`);
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
        expect(tree.readContent(`/src/app/tests/controllers/tests.resolver.ts`)).toContain(`../services/tests.service`);
        done();
      });
  });

  it('should generate a GraphQL schema-first module', done => {
    const options = { ...defaultResourceOptions, crud: true, type: 'graphql-schema-first' };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('resource', options, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/src/app/tests/tests.graphql',
            '/src/app/tests/tests.module.ts',
            '/src/app/tests/controllers/tests.resolver.spec.ts',
            '/src/app/tests/controllers/tests.resolver.ts',
            '/src/app/tests/services/tests.service.spec.ts',
            '/src/app/tests/services/tests.service.ts',
            '/src/app/tests/model/dtos/create-test.input.ts',
            '/src/app/tests/model/dtos/update-test.input.ts',
            '/src/app/tests/model/entities/test.entity.ts',
          ]),
        );
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.resolver`);
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
        expect(tree.readContent(`/src/app/tests/controllers/tests.resolver.ts`)).toContain(`../services/tests.service`);
        done();
      });
  });

  it('should generate a GraphQL schema-first module with CRUD', done => {
    const options = { ...defaultResourceOptions, crud: true, type: 'graphql-schema-first' };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('resource', options, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/src/app/tests/tests.graphql',
            '/src/app/tests/tests.module.ts',
            '/src/app/tests/controllers/tests.resolver.spec.ts',
            '/src/app/tests/controllers/tests.resolver.ts',
            '/src/app/tests/services/tests.service.spec.ts',
            '/src/app/tests/services/tests.service.ts',
            '/src/app/tests/model/dtos/create-test.input.ts',
            '/src/app/tests/model/dtos/update-test.input.ts',
            '/src/app/tests/model/entities/test.entity.ts',
          ]),
        );
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.resolver`);
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
        expect(tree.readContent(`/src/app/tests/controllers/tests.resolver.ts`)).toContain(`../services/tests.service`);
        done();
      });
  });

  it('should generate a microservice module', done => {
    const options = { ...defaultResourceOptions, type: 'microservice' };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('resource', options, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/src/app/tests/tests.module.ts',
            '/src/app/tests/controllers/tests.controller.spec.ts',
            '/src/app/tests/controllers/tests.controller.ts',
            '/src/app/tests/services/tests.service.spec.ts',
            '/src/app/tests/services/tests.service.ts',
          ]),
        );
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.controller`);
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
        expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(
          `../services/tests.service`,
        );

        done();
      });
  });

  it('should generate a microservice module with CRUD', done => {
    const options = { ...defaultResourceOptions, crud: true, type: 'microservice' };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('resource', options, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/src/app/tests/tests.module.ts',
            '/src/app/tests/controllers/tests.controller.spec.ts',
            '/src/app/tests/controllers/tests.controller.ts',
            '/src/app/tests/services/tests.service.spec.ts',
            '/src/app/tests/services/tests.service.ts',
            '/src/app/tests/model/dtos/create-test.dto.ts',
            '/src/app/tests/model/dtos/update-test.dto.ts',
            '/src/app/tests/model/entities/test.entity.ts',
          ]),
        );
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.controller`);
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
        expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(
          `../services/tests.service`,
        );
        expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(
          `../model/dtos/create-test.dto`,
        );
        expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(
          `../model/dtos/update-test.dto`,
        );
        expect(tree.readContent(`/src/app/tests/services/tests.service.ts`)).toContain(`../model/dtos/create-test.dto`);
        expect(tree.readContent(`/src/app/tests/services/tests.service.ts`)).toContain(`../model/dtos/update-test.dto`);
        done();
      });
  });

  it('should generate a WebSocket module', done => {
    const options = { ...defaultResourceOptions, type: 'ws' };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('resource', options, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/src/app/tests/tests.module.ts',
            '/src/app/tests/controllers/tests.gateway.spec.ts',
            '/src/app/tests/controllers/tests.gateway.ts',
            '/src/app/tests/services/tests.service.spec.ts',
            '/src/app/tests/services/tests.service.ts',
          ]),
        );
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.gateway`);
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
        expect(tree.readContent(`/src/app/tests/controllers/tests.gateway.ts`)).toContain(`../services/tests.service`);

        done();
      });
  });

  it('should generate a WebSocket module with CRUD', done => {
    const options = { ...defaultResourceOptions, crud: true, type: 'ws' };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('resource', options, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/src/app/tests/tests.module.ts',
            '/src/app/tests/controllers/tests.gateway.spec.ts',
            '/src/app/tests/controllers/tests.gateway.ts',
            '/src/app/tests/services/tests.service.spec.ts',
            '/src/app/tests/services/tests.service.ts',
            '/src/app/tests/model/dtos/create-test.dto.ts',
            '/src/app/tests/model/dtos/update-test.dto.ts',
            '/src/app/tests/model/entities/test.entity.ts',
          ]),
        );
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.gateway`);
        expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
        expect(tree.readContent(`/src/app/tests/controllers/tests.gateway.ts`)).toContain(`../services/tests.service`);
        expect(tree.readContent(`/src/app/tests/controllers/tests.gateway.ts`)).toContain(
          `../model/dtos/create-test.dto`,
        );
        expect(tree.readContent(`/src/app/tests/controllers/tests.gateway.ts`)).toContain(
          `../model/dtos/update-test.dto`,
        );
        expect(tree.readContent(`/src/app/tests/services/tests.service.ts`)).toContain(`../model/dtos/create-test.dto`);
        expect(tree.readContent(`/src/app/tests/services/tests.service.ts`)).toContain(`../model/dtos/update-test.dto`);
        done();
      });
  });
});
