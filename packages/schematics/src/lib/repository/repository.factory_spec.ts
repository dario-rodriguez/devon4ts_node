import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { concatMap } from 'rxjs/operators';

describe('Repository Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('repository', { name: 'foo' }).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should generate the entity if not exists', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('repository', { name: 'module/repo' }, tree)))
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/module/model/entities/repo.entity.ts');
        done();
      });
  });

  it('should not generate the entity if exists', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree => {
          tree.create('/src/app/module/model/entities/repo.entity.ts', Buffer.from('this is a fake entity'));
          return runner.runSchematicAsync('repository', { name: 'module/repo' }, tree);
        }),
      )
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/module/model/entities/repo.entity.ts');
        expect(tree.readContent('/src/app/module/model/entities/repo.entity.ts')).toStrictEqual(
          'this is a fake entity',
        );
        done();
      });
  });

  it('should generate the repository file', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree => {
          return runner.runSchematicAsync('repository', { name: 'module/repo' }, tree);
        }),
      )
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/module/repositories/repo.repository.ts');
        done();
      });
  });

  it('should generate the repository file at root level if no module is provided', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree => {
          return runner.runSchematicAsync('repository', { name: 'repo' }, tree);
        }),
      )
      .subscribe(tree => {
        expect(tree.files).toContain('/src/app/repositories/repo.repository.ts');
        done();
      });
  });

  it('should add the repository to the module provided', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree =>
          runner
            .runSchematicAsync('module', { name: 'module' }, tree)
            .pipe(concatMap(tree => runner.runSchematicAsync('repository', { name: 'module/repo' }, tree))),
        ),
      )
      .subscribe(tree => {
        const moduleContent = tree.readContent('/src/app/module/module.module.ts');
        expect(moduleContent).toContain(`import { RepoRepository } from './repositories/repo.repository';`);
        expect(moduleContent).toMatch(/TypeOrmModule\.forFeature\(\[(.|\n)*RepoRepository(.|\n)*\]\)/g);
        done();
      });
  });

  it('should add the repository to AppModule if no other module is provided', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree => {
          return runner.runSchematicAsync('repository', { name: 'repo' }, tree);
        }),
      )
      .subscribe(tree => {
        const moduleContent = tree.readContent('/src/app/app.module.ts');
        expect(moduleContent).toContain(`import { RepoRepository } from './repositories/repo.repository';`);
        expect(moduleContent).toMatch(/TypeOrmModule\.forFeature\(\[(.|\n)*RepoRepository(.|\n)*\]\)/g);
        done();
      });
  });
});
