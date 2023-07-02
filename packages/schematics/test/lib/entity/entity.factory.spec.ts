import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Entity Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(__dirname, '../../../src/collection.json'),
  );

  it('should throw an error if not executed at project root folder', async () => {
    try {
      await runner.runSchematic('entity', { name: 'foo' });
      fail();
    } catch (error) {
      expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
    }
  });

  it('should generate the entity at root level if no module is provided', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('entity', { name: 'foo' }, tree);

    expect(tree?.files).toContain('/src/app/model/entities/foo.entity.ts');
    expect(tree?.readContent('/src/app/model/entities/foo.entity.ts')).toContain('class Foo ');
  });

  it('should dasherize the entity file name', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('entity', { name: 'fooBar' }, tree);

    expect(tree?.files).toContain('/src/app/model/entities/foo-bar.entity.ts');
    expect(tree?.readContent('/src/app/model/entities/foo-bar.entity.ts')).toContain('class FooBar ');
  });

  it('should generate the entity at the provided module', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('entity', { name: 'foo/bar' }, tree);

    expect(tree?.files).toContain('/src/app/foo/model/entities/bar.entity.ts');
    expect(tree?.readContent('/src/app/foo/model/entities/bar.entity.ts')).toContain('class Bar ');
  });

  it('should add the entity to AppModule as TypeOrmModule.forFeature', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('entity', { name: 'foo' }, tree);

    const moduleContent = tree?.readContent('/src/app/app.module.ts');
    expect(moduleContent).toContain("import { Foo } from './model/entities/foo.entity'");
    expect(moduleContent).toContain("import { TypeOrmModule } from '@nestjs/typeorm'");
    expect(moduleContent).toMatch(/imports: \[(.|\n)*TypeOrmModule.forFeature\(\[(.|\n)*Foo(.|\n)*\]\)(.|\n)*\],/g);
  });

  it('should add the entity to the specified module as TypeOrmModule.forFeature', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('module', { name: 'foo' }, tree);
    tree = await runner.runSchematic('entity', { name: 'foo/bar' }, tree);

    const moduleContent = tree?.readContent('/src/app/foo/foo.module.ts');
    expect(moduleContent).toContain("import { Bar } from './model/entities/bar.entity'");
    expect(moduleContent).toContain("import { TypeOrmModule } from '@nestjs/typeorm'");
    expect(moduleContent).toMatch(/imports: \[(.|\n)*TypeOrmModule.forFeature\(\[(.|\n)*Bar(.|\n)*\]\)(.|\n)*\],/g);
  });

  it('should overwrite previous entity if overwrite option is true', async () => {
    const fakeTree: UnitTestTree = new UnitTestTree(new EmptyTree());
    const fakeEntityContent = 'FAKE ENTITY';
    const entityPath = '/src/app/model/entities/foo.entity.ts';

    fakeTree?.create(entityPath, fakeEntityContent);

    let tree = await runner.runSchematic('application', { name: '' }, fakeTree);
    tree = await runner.runSchematic('entity', { name: 'foo', overwrite: true }, tree);

    const entityContent = tree?.readContent(entityPath);
    expect(entityContent).not.toContain(fakeEntityContent);
    expect(entityContent).toContain('class Foo ');
  });

  it('should add the entity to main data source', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('typeorm', { db: 'postgres' }, tree);
    tree = await runner.runSchematic('entity', { name: 'foo', overwrite: true }, tree);

    const mainDataSource = tree?.readContent('/src/app/shared/database/main-data-source.ts');
    expect(mainDataSource).toMatch(/entities: \[(.|\n)*Foo(.|\n)*\]/g);
    expect(mainDataSource).toContain(`import { Foo } from '../../model/entities/foo.entity'`);
  });
});
