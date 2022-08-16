import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { concatMap } from 'rxjs/operators';
import { packagesVersion } from '../packagesVersion';

describe('Mailer Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should generate the files required for mailer functionality', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('mailer', {}, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/package.json',
            '/docker-compose.yml',
            '/templates/partials/layout.handlebars',
            '/templates/views/example.handlebars',
          ]),
        );
        done();
      });
  });

  it('should merge the json and yaml files', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('mailer', {}, tree)))
      .subscribe(tree => {
        const packageJson = tree.readContent('/package.json');
        const dockerCompose = tree.readContent('/docker-compose.yml');

        expect(packageJson).toContain(packagesVersion.devon4nodeMailer.packageName);
        expect(packageJson).toContain(packagesVersion.handlebars.packageName);
        expect(dockerCompose).toContain(`maildev:
    image: 'djfarrelly/maildev'`);
        done();
      });
  });

  it('should add mailer module to the core module', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('mailer', {}, tree)))
      .subscribe(tree => {
        const coreModule = tree.readContent('/src/app/core/core.module.ts');

        expect(coreModule).toMatch(/imports: \[(\n|.)*MailerModule.register(\n|.)*\]/g);
        done();
      });
  });

  it('should add configuration to global config definition', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree =>
          runner
            .runSchematicAsync('convict', {}, tree)
            .pipe(concatMap(tree => runner.runSchematicAsync('mailer', {}, tree))),
        ),
      )
      .subscribe(tree => {
        const config = tree.readContent('/src/config.ts');

        expect(config).toMatch(/const config(.|\n)*mailer:(.|\n)*/g);
        done();
      });
  });
});
