import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Interceptor Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(__dirname, '../../../src/collection.json'),
  );

  it('should throw an error if not executed at project root folder', async () => {
    try {
      await runner.runSchematic('interceptor', { name: 'foo' });
      fail();
    } catch (error) {
      expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
    }
  });

  it('should create the interceptor inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('interceptor', { name: 'interceptor' }, tree);

    expect(tree?.files).toContain('/src/app/interceptors/interceptor.interceptor.ts');
    expect(tree?.files).toContain('/src/app/interceptors/interceptor.interceptor.spec.ts');
  });

  it('should not generate spec if spec param is false', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('interceptor', { name: 'interceptor', spec: false }, tree);

    expect(tree?.files).toContain('/src/app/interceptors/interceptor.interceptor.ts');
    expect(tree?.files).not.toContain('/src/app/interceptors/interceptor.interceptor.spec.ts');
  });

  it('should create the interceptor at specified module inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('interceptor', { name: 'module/interceptor' }, tree);

    expect(tree?.files).toContain('/src/app/module/interceptors/interceptor.interceptor.ts');
    expect(tree?.files).toContain('/src/app/module/interceptors/interceptor.interceptor.spec.ts');
  });
});
