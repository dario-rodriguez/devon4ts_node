import { normalize } from '@angular-devkit/core';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { concatMap } from 'rxjs/operators';
import { IControllerOptions } from './controller.factory';

describe('Controller Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('controller', { name: 'controller' }).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should generate the controller files the current app', done => {
    const optionsApp: IControllerOptions = {
      name: 'project',
    };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('controller', optionsApp, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/src/app/controllers/projects.controller.ts',
            '/src/app/controllers/projects.controller.spec.ts',
          ]),
        );
        done();
      });
  });

  it("shouldn't generate the spec if spec option is false", done => {
    const optionsApp: IControllerOptions = {
      name: 'project',
      spec: false,
    };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('controller', optionsApp, tree)))
      .subscribe(tree => {
        expect(tree.files).not.toContain('/src/app/controllers/projects.controller.spec.ts');
        done();
      });
  });

  it('should generate the controller at the specified module', done => {
    const optionsApp: IControllerOptions = {
      name: 'fooBar/fooBar',
    };
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree =>
          runner
            .runSchematicAsync('controller', optionsApp, tree)
            .pipe(concatMap(tree => runner.runSchematicAsync('module', { name: 'fooBar' }, tree))),
        ),
      )
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/src/app/foo-bar/controllers/foo-bars.controller.ts',
            '/src/app/foo-bar/controllers/foo-bars.controller.spec.ts',
          ]),
        );
        done();
      });
  });

  it('should add the controllers to its module', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree =>
          runner
            .runSchematicAsync('module', { name: 'foo' }, tree)
            .pipe(concatMap(tree => runner.runSchematicAsync('controller', { name: 'foo/foo' }, tree))),
        ),
      )
      .subscribe(tree => {
        const fooModuleContent = tree.readContent(normalize('/src/app/foo/foo.module.ts'));
        expect(fooModuleContent).toContain("import { FoosController } from './controllers/foos.controller';");
        expect(fooModuleContent).toMatch(/controllers: \[(.|\n)*FoosController(.|\n)*\]/g);
        done();
      });
  });

  it('should add the controllers to app module if no other module is specified', done => {
    const optionsApp: IControllerOptions = {
      name: '',
    };
    const optionsModule: IControllerOptions = {
      name: 'foo',
    };
    runner
      .runSchematicAsync('application', optionsApp)
      .pipe(concatMap(tree => runner.runSchematicAsync('controller', optionsModule, tree)))
      .subscribe(tree => {
        const fooModuleContent = tree.readContent(normalize('/src/app/app.module.ts'));
        expect(fooModuleContent).toContain("import { FoosController } from './controllers/foos.controller';");
        expect(fooModuleContent).toMatch(/controllers: \[(.|\n)*FoosController(.|\n)*\]/g);
        done();
      });
  });
});
