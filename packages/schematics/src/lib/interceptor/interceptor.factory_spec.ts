import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { concatMap } from 'rxjs/operators';

describe('Interceptor Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('interceptor', { name: 'foo' }).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should create the interceptor inside src/app folder', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('interceptor', { name: 'interceptor' }, tree)))
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/interceptors/interceptor.interceptor.ts');
        expect(tree.files).toContain('/src/app/interceptors/interceptor.interceptor.spec.ts');
        done();
      });
  });

  it('should not generate spec if spec param is false', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('interceptor', { name: 'interceptor', spec: false }, tree)))
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/interceptors/interceptor.interceptor.ts');
        expect(tree.files).not.toContain('/src/app/interceptors/interceptor.interceptor.spec.ts');
        done();
      });
  });

  it('should create the interceptor at specified module inside src/app folder', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('interceptor', { name: 'module/interceptor' }, tree)))
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/module/interceptors/interceptor.interceptor.ts');
        expect(tree.files).toContain('/src/app/module/interceptors/interceptor.interceptor.spec.ts');
        done();
      });
  });
});
