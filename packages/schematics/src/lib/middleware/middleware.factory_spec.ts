import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { concatMap } from 'rxjs/operators';

describe('Middleware Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('middleware', { name: 'foo' }).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should create the middleware inside src/app folder', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('middleware', { name: 'test' }, tree)))
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/test.middleware.ts');
        expect(tree.files).toContain('/src/app/test.middleware.spec.ts');
        done();
      });
  });

  it('should not generate spec if spec param is false', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('middleware', { name: 'test', spec: false }, tree)))
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/test.middleware.ts');
        expect(tree.files).not.toContain('/src/app/test.middleware.spec.ts');
        done();
      });
  });

  it('should create the middleware at specified module inside src/app folder', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('middleware', { name: 'module/test' }, tree)))
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/module/test.middleware.ts');
        expect(tree.files).toContain('/src/app/module/test.middleware.spec.ts');
        done();
      });
  });
});
