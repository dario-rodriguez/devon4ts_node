import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Module Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(__dirname, '../../../src/collection.json'),
  );

  it('should throw an error if not executed at project root folder', async () => {
    try {
      await runner.runSchematic('module', { name: 'foo' });
      fail();
    } catch (error) {
      expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
    }
  });

  it('should create the module inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('module', { name: 'test' }, tree);

    expect(tree?.files).toContain('/src/app/test/test.module.ts');
  });

  it('should create the module at specified module inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('module', { name: 'module/test' }, tree);

    expect(tree?.files).toContain('/src/app/module/test/test.module.ts');
  });
});
