import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { concatMap } from 'rxjs/operators';

describe('Entity Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('entity', { name: 'foo' }).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should generate the entity at root level if no module is provided', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('entity', { name: 'foo' }, tree)))
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/model/entities/foo.entity.ts');
        expect(tree.readContent('/src/app/model/entities/foo.entity.ts')).toContain('class Foo ');
        done();
      });
  });

  it('should dasherize the entity file name', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('entity', { name: 'fooBar' }, tree)))
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/model/entities/foo-bar.entity.ts');
        expect(tree.readContent('/src/app/model/entities/foo-bar.entity.ts')).toContain('class FooBar ');
        done();
      });
  });

  it('should generate the entity at the provided module', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('entity', { name: 'foo/bar' }, tree)))
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/foo/model/entities/bar.entity.ts');
        expect(tree.readContent('/src/app/foo/model/entities/bar.entity.ts')).toContain('class Bar ');
        done();
      });
  });

  it('should add the entity to AppModule as TypeOrmModule.forFeature', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('entity', { name: 'foo' }, tree)))
      .subscribe(tree => {
        const moduleContent = tree.readContent('/src/app/app.module.ts');
        expect(moduleContent).toContain("import { Foo } from './model/entities/foo.entity'");
        expect(moduleContent).toContain("import { TypeOrmModule } from '@nestjs/typeorm'");
        expect(moduleContent).toMatch(/imports: \[(.|\n)*TypeOrmModule.forFeature\(\[(.|\n)*Foo(.|\n)*\]\)(.|\n)*\],/g);
        done();
      });
  });

  it('should add the entity to the specified module as TypeOrmModule.forFeature', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree =>
          runner
            .runSchematicAsync('module', { name: 'foo' }, tree)
            .pipe(concatMap(tree => runner.runSchematicAsync('entity', { name: 'foo/bar' }, tree))),
        ),
      )
      .subscribe(tree => {
        const moduleContent = tree.readContent('/src/app/foo/foo.module.ts');
        expect(moduleContent).toContain("import { Bar } from './model/entities/bar.entity'");
        expect(moduleContent).toContain("import { TypeOrmModule } from '@nestjs/typeorm'");
        expect(moduleContent).toMatch(/imports: \[(.|\n)*TypeOrmModule.forFeature\(\[(.|\n)*Bar(.|\n)*\]\)(.|\n)*\],/g);
        done();
      });
  });

  it('should overwrite previous entity if overwrite option is true', done => {
    const fakeTree: UnitTestTree = new UnitTestTree(new EmptyTree());
    const fakeEntityContent = 'FAKE ENTITY';
    const entityPath = '/src/app/model/entities/foo.entity.ts';

    fakeTree.create(entityPath, fakeEntityContent);

    runner
      .runSchematicAsync('application', { name: '' }, fakeTree)
      .pipe(concatMap(tree => runner.runSchematicAsync('entity', { name: 'foo', overwrite: true }, tree)))
      .subscribe(tree => {
        const entityContent = tree.readContent(entityPath);
        expect(entityContent).not.toContain(fakeEntityContent);
        expect(entityContent).toContain('class Foo ');
        done();
      });
  });

  it('should add the entity to main data source', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree =>
          runner
            .runSchematicAsync('typeorm', { db: 'postgres' }, tree)
            .pipe(concatMap(tree => runner.runSchematicAsync('entity', { name: 'foo', overwrite: true }, tree))),
        ),
      )
      .subscribe(tree => {
        const mainDataSource = tree.readContent('/src/app/shared/database/main-data-source.ts');
        expect(mainDataSource).toMatch(/entities: \[(.|\n)*Foo(.|\n)*\]/g);
        expect(mainDataSource).toContain(`import { Foo } from '../../model/entities/foo.entity'`);
        done();
      });
  });
});
