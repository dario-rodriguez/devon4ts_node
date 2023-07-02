import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { packagesVersion } from '../../../src/lib/packagesVersion';

describe('Mailer Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(__dirname, '../../../src/collection.json'),
  );

  it('should generate the files required for mailer functionality', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('mailer', {}, tree);

    expect(tree?.files).toEqual(
      expect.arrayContaining([
        '/package.json',
        '/docker-compose.yml',
        '/templates/partials/layout.handlebars',
        '/templates/views/example.handlebars',
      ]),
    );
  });

  it('should merge the json and yaml files', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('mailer', {}, tree);

    const packageJson = tree?.readContent('/package.json');
    const dockerCompose = tree?.readContent('/docker-compose.yml');

    expect(packageJson).toContain(packagesVersion['devon4nodeMailer'].packageName);
    expect(packageJson).toContain(packagesVersion['handlebars'].packageName);
    expect(dockerCompose).toContain(`maildev:
    image: 'djfarrelly/maildev'`);
  });

  it('should add mailer module to the core module', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('mailer', {}, tree);

    const coreModule = tree?.readContent('/src/app/core/core.module.ts');

    expect(coreModule).toMatch(/imports: \[(\n|.)*MailerModule.register(\n|.)*\]/g);
  });

  it('should add configuration to global config definition', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('convict', {}, tree);
    tree = await runner.runSchematic('mailer', {}, tree);

    const config = tree?.readContent('/src/config.ts');

    expect(config).toMatch(/const config(.|\n)*mailer:(.|\n)*/g);
  });
});
