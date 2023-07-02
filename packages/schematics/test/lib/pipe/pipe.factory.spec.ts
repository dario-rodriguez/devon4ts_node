import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Pipe Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(__dirname, '../../../src/collection.json'),
  );

  it('should throw an error if not executed at project root folder', async () => {
    try {
      await runner.runSchematic('pipe', { name: 'foo' });
      fail();
    } catch (error) {
      expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
    }
  });

  it('should create the pipe inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('pipe', { name: 'pipe' }, tree);

    expect(tree?.files).toContain('/src/app/pipes/pipe.pipe.ts');
    expect(tree?.files).toContain('/src/app/pipes/pipe.pipe.spec.ts');
  });

  it('should not generate spec if spec param is false', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('pipe', { name: 'pipe', spec: false }, tree);

    expect(tree?.files).toContain('/src/app/pipes/pipe.pipe.ts');
    expect(tree?.files).not.toContain('/src/app/pipes/pipe.pipe.spec.ts');
  });

  it('should create the pipe at specified module inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('pipe', { name: 'module/pipe' }, tree);

    expect(tree?.files).toContain('/src/app/module/pipes/pipe.pipe.ts');
    expect(tree?.files).toContain('/src/app/module/pipes/pipe.pipe.spec.ts');
  });
});
