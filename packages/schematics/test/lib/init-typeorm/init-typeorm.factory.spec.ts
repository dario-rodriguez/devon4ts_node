import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Typeorm Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(__dirname, '../../../src/collection.json'),
  );
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

  it('should do nothing if not running at root folder', async () => {
    const tree = await runner.runSchematic('typeorm', { db: 'mysql' });
    expect(tree?.files).toStrictEqual([]);
  });

  it('should generate all files if it is running at root folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('convict', {}, tree);
    tree = await runner.runSchematic('typeorm', { db: 'mysql' }, tree);

    expect(tree?.files).toEqual(
      expect.arrayContaining([
        '/package.json',
        '/docker-compose.yml',
        '/config/prod.json',
        '/config/develop.json',
        '/src/app/shared/database/main-data-source.ts',
        '/src/app/shared/model/entities/base.entity.ts',
      ]),
    );
  });

  it('should do not generate config files if convict is not present in the project', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('typeorm', { db: 'mysql' }, tree);

    expect(tree?.files).toEqual(expect.not.arrayContaining(['/config/prod.json', '/config/develop.json']));
    expect(tree?.files).toEqual(
      expect.arrayContaining([
        '/package.json',
        '/docker-compose.yml',
        '/src/app/shared/database/main-data-source.ts',
        '/src/app/shared/model/entities/base.entity.ts',
      ]),
    );
  });

  it('should be imported at CoreModule', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('typeorm', { db: 'mysql' }, tree);

    const coreModule = tree?.readContent('/src/app/core/core.module.ts');
    expect(coreModule).toContain("import { AppDataSource } from '../shared/database/main-data-source'");
    expect(coreModule).toContain("import { TypeOrmModule } from '@nestjs/typeorm'");
    expect(coreModule).toMatch(/imports: \[(.|\n)*TypeOrmModule.forRootAsync/g);
  });

  it('should configure the datasource using the config', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('convict', {}, tree);
    tree = await runner.runSchematic('typeorm', { db: 'postgres' }, tree);

    expect(tree?.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
      dataSource(
        `...config.database,
  type: 'postgres',`,
        true,
      ),
    );
  });

  describe('postgres', () => {
    it('should configure the datasource for postgres', async () => {
      let tree = await runner.runSchematic('application', { name: '' });
      tree = await runner.runSchematic('typeorm', { db: 'postgres' }, tree);

      expect(tree?.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
        dataSource(`type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'test',
  password: 'test',
  database: 'test',`),
      );
    });
  });

  describe('cockroachdb', () => {
    it('should configure the datasource for cockroachdb', async () => {
      let tree = await runner.runSchematic('application', { name: '' });
      tree = await runner.runSchematic('typeorm', { db: 'cockroachdb' }, tree);

      expect(tree?.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
        dataSource(`type: 'cockroachdb',
  host: 'localhost',
  port: 26257,
  username: 'root',
  password: '',
  database: 'defaultdb',`),
      );
    });
  });

  describe('mariadb', () => {
    it('should configure the datasource for mariadb', async () => {
      let tree = await runner.runSchematic('application', { name: '' });
      tree = await runner.runSchematic('typeorm', { db: 'mariadb' }, tree);

      expect(tree?.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
        dataSource(`type: 'mariadb',
  host: 'localhost',
  port: 3306,
  username: 'test',
  password: 'test',
  database: 'test',`),
      );
    });
  });

  describe('mysql', () => {
    it('should configure the datasource for mysql', async () => {
      let tree = await runner.runSchematic('application', { name: '' });
      tree = await runner.runSchematic('typeorm', { db: 'mysql' }, tree);

      expect(tree?.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
        dataSource(`type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'test',
  password: 'test',
  database: 'test',`),
      );
    });
  });

  describe('sqlite', () => {
    it('should configure the datasource for sqlite', async () => {
      let tree = await runner.runSchematic('application', { name: '' });
      tree = await runner.runSchematic('typeorm', { db: 'sqlite' }, tree);

      expect(tree?.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
        dataSource(`type: 'sqlite',
  database: ':memory:',`),
      );
    });
  });

  describe('oracle', () => {
    it('should configure the datasource for oracle', async () => {
      let tree = await runner.runSchematic('application', { name: '' });
      tree = await runner.runSchematic('typeorm', { db: 'oracle' }, tree);

      expect(tree?.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
        dataSource(`type: 'oracle',
  host: 'localhost',
  port: 1521,
  username: 'system',
  password: 'oracle',
  sid: 'xe.oracle.docker',`),
      );
    });
  });

  describe('mssql', () => {
    it('should configure the datasource for mssql', async () => {
      let tree = await runner.runSchematic('application', { name: '' });
      tree = await runner.runSchematic('typeorm', { db: 'mssql' }, tree);

      expect(tree?.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
        dataSource(`type: 'mssql',
  host: 'localhost',
  username: 'sa',
  password: 'Admin12345',
  database: 'tempdb',`),
      );
    });
  });

  describe('mongodb', () => {
    it('should configure the datasource for mongodb', async () => {
      let tree = await runner.runSchematic('application', { name: '' });
      tree = await runner.runSchematic('typeorm', { db: 'mongodb' }, tree);

      expect(tree?.readContent('/src/app/shared/database/main-data-source.ts')).toStrictEqual(
        dataSource(`type: 'mongodb',
  database: 'test',`),
      );
    });
  });
});
