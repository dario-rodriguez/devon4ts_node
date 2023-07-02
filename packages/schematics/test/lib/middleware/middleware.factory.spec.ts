import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Middleware Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(__dirname, '../../../src/collection.json'),
  );

  it('should throw an error if not executed at project root folder', async () => {
    try {
      await runner.runSchematic('middleware', { name: 'foo' });
      fail();
    } catch (error) {
      expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
    }
  });

  it('should create the middleware inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('middleware', { name: 'test' }, tree);

    expect(tree?.files).toContain('/src/app/test.middleware.ts');
    expect(tree?.files).toContain('/src/app/test.middleware.spec.ts');
  });

  it('should not generate spec if spec param is false', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('middleware', { name: 'test', spec: false }, tree);

    expect(tree?.files).toContain('/src/app/test.middleware.ts');
    expect(tree?.files).not.toContain('/src/app/test.middleware.spec.ts');
  });

  it('should create the middleware at specified module inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('middleware', { name: 'module/test' }, tree);

    expect(tree?.files).toContain('/src/app/module/test.middleware.ts');
    expect(tree?.files).toContain('/src/app/module/test.middleware.spec.ts');
  });
});
