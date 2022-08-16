import { join } from 'path';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { concatMap } from 'rxjs/operators';

describe('Convict Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('convict', {}).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should generate all files to configure convict in the project', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('convict', {}, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining(['/src/config.ts', '/config/develop.json', '/config/prod.json']),
        );
        done();
      });
  });

  it('should update the main in order to use properties from config', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('convict', {}, tree)))
      .subscribe(tree => {
        const mainContent = tree.readContent('/src/main.ts');
        expect(mainContent).toContain('await app.listen(config.port);');
        expect(mainContent).toContain('defaultVersion: config.defaultVersion,');
        done();
      });
  });

  it('should update the logger in order to use properties from config', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('convict', {}, tree)))
      .subscribe(tree => {
        const mainContent = tree.readContent('/src/app/shared/logger/winston.logger.ts');
        expect(mainContent).toContain('oneLineStack(config.logger.oneLineStack),');
        expect(mainContent).toContain('colorize(config.logger.color),');
        expect(mainContent).toContain('level: config.logger.loggerLevel,');
        done();
      });
  });
});
