import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Guard Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(__dirname, '../../../src/collection.json'),
  );

  it('should throw an error if not executed at project root folder', async () => {
    try {
      await runner.runSchematic('guard', { name: 'foo' });
      fail();
    } catch (error) {
      expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
    }
  });

  it('should create the guard inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('guard', { name: 'guard' }, tree);

    expect(tree?.files).toContain('/src/app/guards/guard.guard.ts');
    expect(tree?.files).toContain('/src/app/guards/guard.guard.spec.ts');
  });

  it('should not generate spec if spec param is false', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('guard', { name: 'guard', spec: false }, tree);

    expect(tree?.files).toContain('/src/app/guards/guard.guard.ts');
    expect(tree?.files).not.toContain('/src/app/guards/guard.guard.spec.ts');
  });

  it('should create the guard at specified module inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('guard', { name: 'module/guard' }, tree);

    expect(tree?.files).toContain('/src/app/module/guards/guard.guard.ts');
    expect(tree?.files).toContain('/src/app/module/guards/guard.guard.spec.ts');
  });
});
