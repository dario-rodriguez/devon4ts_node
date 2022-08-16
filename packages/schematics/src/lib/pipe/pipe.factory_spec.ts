import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { concatMap } from 'rxjs/operators';

describe('Pipe Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('pipe', { name: 'foo' }).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should create the pipe inside src/app folder', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('pipe', { name: 'pipe' }, tree)))
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/pipes/pipe.pipe.ts');
        expect(tree.files).toContain('/src/app/pipes/pipe.pipe.spec.ts');
        done();
      });
  });

  it('should not generate spec if spec param is false', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('pipe', { name: 'pipe', spec: false }, tree)))
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/pipes/pipe.pipe.ts');
        expect(tree.files).not.toContain('/src/app/pipes/pipe.pipe.spec.ts');
        done();
      });
  });

  it('should create the pipe at specified module inside src/app folder', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('pipe', { name: 'module/pipe' }, tree)))
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/module/pipes/pipe.pipe.ts');
        expect(tree.files).toContain('/src/app/module/pipes/pipe.pipe.spec.ts');
        done();
      });
  });
});
