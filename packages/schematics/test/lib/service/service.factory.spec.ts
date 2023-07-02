import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Service Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(__dirname, '../../../src/collection.json'),
  );

  it('should throw an error if not executed at project root folder', async () => {
    try {
      await runner.runSchematic('service', { name: 'test' });
      fail();
    } catch (error) {
      expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
    }
  });

  it('should generate the service files', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic(
      'service',
      {
        name: 'foos',
      },
      tree,
    );

    expect(tree?.files).toContain('/src/app/services/foos.service.ts');
    expect(tree?.files).toContain('/src/app/services/foos.service.spec.ts');
  });

  it('should pluralize the name', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic(
      'service',
      {
        name: 'foo',
      },
      tree,
    );

    expect(tree?.files).toContain('/src/app/services/foos.service.ts');
    expect(tree?.files).toContain('/src/app/services/foos.service.spec.ts');
  });

  it('should skip spec files if spec is false', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic(
      'service',
      {
        name: 'foo',
        spec: false,
      },
      tree,
    );

    expect(tree?.files).toContain('/src/app/services/foos.service.ts');
    expect(tree?.files).not.toContain('/src/app/services/foos.service.spec.ts__templ__');
  });

  it('should generate the service files inside the specified module', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic(
      'service',
      {
        name: 'foo/foo',
        spec: false,
      },
      tree,
    );

    expect(tree?.files).toContain('/src/app/foo/services/foos.service.ts');
    expect(tree?.files).not.toContain('/src/app/foo/services/foos.service.spec.ts__templ__');
  });
});
