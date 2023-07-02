import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Filter Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(__dirname, '../../../src/collection.json'),
  );

  it('should throw an error if not executed at project root folder', async () => {
    try {
      await runner.runSchematic('filter', { name: 'foo' });
      fail();
    } catch (error) {
      expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
    }
  });

  it('should not generate spec if spec param is false', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('filter', { name: 'filter', spec: false }, tree);

    expect(tree?.files).toContain('/src/app/filters/filter.filter.ts');
    expect(tree?.files).not.toContain('/src/app/filters/filter.filter.spec.ts');
  });

  it('should create the filter inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('filter', { name: 'filter' }, tree);

    expect(tree?.files).toContain('/src/app/filters/filter.filter.ts');
    expect(tree?.files).toContain('/src/app/filters/filter.filter.spec.ts');
  });

  it('should create the filter at specified module inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('filter', { name: 'module/filter' }, tree);

    expect(tree?.files).toContain('/src/app/module/filters/filter.filter.ts');
    expect(tree?.files).toContain('/src/app/module/filters/filter.filter.spec.ts');
  });
});
