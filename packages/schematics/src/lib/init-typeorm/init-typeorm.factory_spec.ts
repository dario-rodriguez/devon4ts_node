import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { concatMap } from 'rxjs/operators';

describe('Typeorm Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  const dataSource = (content: string, config?: boolean): string => `import 'reflect-metadata';
import { DataSource } from 'typeorm';
${config ? "import config from '../../../config';\n" : ''}
export const AppDataSource = new DataSource({
  ${content}
  entities: [],
  migrations: [],
  subscribers: [],
});
`;

  it('should do nothing if not running at root folder', done => {
    runner.runSchematicAsync('typeorm', { db: 'mysql' }).subscribe(tree => {
      expect(tree.files).toStrictEqual([]);
      done();
    });
  });

  it('should generate all files if it is running at root folder', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree =>
          runner
            .runSchematicAsync('convict', {}, tree)
            .pipe(concatMap(tree => runner.runSchematicAsync('typeorm', { db: 'mysql' }, tree))),
        ),
      )
      .subscribe(tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/package.json',
            '/docker-compose.yml',
            '/config/prod.json',
            '/config/develop.json',
            '/src/app/shared/database/main-data-source.ts',
            '/src/app/shared/model/entities/base.entity.ts',
          ]),
        );
        done();
      });
  });

  it('should do not generate config files if convict is not present in the project', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('typeorm', { db: 'mysql' }, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(expect.not.arrayContaining(['/config/prod.json', '/config/develop.json']));
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/package.json',
            '/docker-compose.yml',
            '/src/app/shared/database/main-data-source.ts',
            '/src/app/shared/model/entities/base.entity.ts',
          ]),
        );
        done();
      });
  });

  it('should be imported at CoreModule', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('typeorm', { db: 'mysql' }, tree)))
      .subscribe(tree => {
        const coreModule = tree.readContent('/src/app/core/core.module.ts');
        expect(coreModule).toContain("import { AppDataSource } from '../shared/database/main-data-source'");
        expect(coreModule).toContain("import { TypeOrmModule } from '@nestjs/typeorm'");
        expect(coreModule).toMatch(/imports: \[(.|\n)*TypeOrmModule.forRootAsync/g);
        done();
      });
  });

  it('should configure the datasource using the config', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree =>
          runner
            .runSchematicAsync('convict', {}, tree)
            .pipe(concatMap(tree => runner.runSchematicAsync('typeorm', { db: 'postgres' }, tree))),
        ),
      )
      .subscribe(tree => {
        expect(tree.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
          dataSource(
            `...config.database,
  type: 'postgres',`,
            true,
          ),
        );
        done();
      });
  });

  describe('postgres', () => {
    it('should configure the datasource for postgres', done => {
      runner
        .runSchematicAsync('application', { name: '' })
        .pipe(concatMap(tree => runner.runSchematicAsync('typeorm', { db: 'postgres' }, tree)))
        .subscribe(tree => {
          expect(tree.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
            dataSource(`type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'test',
  password: 'test',
  database: 'test',`),
          );
          done();
        });
    });
  });

  describe('cockroachdb', () => {
    it('should configure the datasource for cockroachdb', done => {
      runner
        .runSchematicAsync('application', { name: '' })
        .pipe(concatMap(tree => runner.runSchematicAsync('typeorm', { db: 'cockroachdb' }, tree)))
        .subscribe(tree => {
          expect(tree.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
            dataSource(`type: 'cockroachdb',
  host: 'localhost',
  port: 26257,
  username: 'root',
  password: '',
  database: 'defaultdb',`),
          );
          done();
        });
    });
  });

  describe('mariadb', () => {
    it('should configure the datasource for mariadb', done => {
      runner
        .runSchematicAsync('application', { name: '' })
        .pipe(concatMap(tree => runner.runSchematicAsync('typeorm', { db: 'mariadb' }, tree)))
        .subscribe(tree => {
          expect(tree.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
            dataSource(`type: 'mariadb',
  host: 'localhost',
  port: 3306,
  username: 'test',
  password: 'test',
  database: 'test',`),
          );
          done();
        });
    });
  });

  describe('mysql', () => {
    it('should configure the datasource for mysql', done => {
      runner
        .runSchematicAsync('application', { name: '' })
        .pipe(concatMap(tree => runner.runSchematicAsync('typeorm', { db: 'mysql' }, tree)))
        .subscribe(tree => {
          expect(tree.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
            dataSource(`type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'test',
  password: 'test',
  database: 'test',`),
          );
          done();
        });
    });
  });

  describe('sqlite', () => {
    it('should configure the datasource for sqlite', done => {
      runner
        .runSchematicAsync('application', { name: '' })
        .pipe(concatMap(tree => runner.runSchematicAsync('typeorm', { db: 'sqlite' }, tree)))
        .subscribe(tree => {
          expect(tree.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
            dataSource(`type: 'sqlite',
  database: ':memory:',`),
          );
          done();
        });
    });
  });

  describe('oracle', () => {
    it('should configure the datasource for oracle', done => {
      runner
        .runSchematicAsync('application', { name: '' })
        .pipe(concatMap(tree => runner.runSchematicAsync('typeorm', { db: 'oracle' }, tree)))
        .subscribe(tree => {
          expect(tree.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
            dataSource(`type: 'oracle',
  host: 'localhost',
  port: 1521,
  username: 'system',
  password: 'oracle',
  sid: 'xe.oracle.docker',`),
          );
          done();
        });
    });
  });

  describe('mssql', () => {
    it('should configure the datasource for mssql', done => {
      runner
        .runSchematicAsync('application', { name: '' })
        .pipe(concatMap(tree => runner.runSchematicAsync('typeorm', { db: 'mssql' }, tree)))
        .subscribe(tree => {
          expect(tree.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
            dataSource(`type: 'mssql',
  host: 'localhost',
  username: 'sa',
  password: 'Admin12345',
  database: 'tempdb',`),
          );
          done();
        });
    });
  });

  describe('mongodb', () => {
    it('should configure the datasource for mongodb', done => {
      runner
        .runSchematicAsync('application', { name: '' })
        .pipe(concatMap(tree => runner.runSchematicAsync('typeorm', { db: 'mongodb' }, tree)))
        .subscribe(tree => {
          expect(tree.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
            dataSource(`type: 'mongodb',
  database: 'test',`),
          );
          done();
        });
    });
  });
});
