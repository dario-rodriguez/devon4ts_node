import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { concatMap } from 'rxjs/operators';

describe('Security Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('security', {}).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should add dependencies to package.json', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('security', {}, tree)))
      .subscribe(tree => {
        const fileContent = tree.readContent('/package.json');
        expect(fileContent).toMatch(/"dependencies": {(.|\n)*"helmet":/g);
        done();
      });
  });

  it('should main.ts to add CORS and helmet', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('security', {}, tree)))
      .subscribe(tree => {
        const fileContent = tree.readContent('/src/main.ts');
        expect(fileContent).toContain('app.enableCors');
        expect(fileContent).toContain(`import helmet from 'helmet'`);
        done();
      });
  });
});
