import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { concatMap } from 'rxjs/operators';
import { IDevon4nodeApplicationOptions } from '../devon4node-application/devon4node-application.factory';

describe('Auth Factory', () => {
  const runner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  const appOptions: IDevon4nodeApplicationOptions = {
    name: '',
  };

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('auth-jwt', {}).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should generate all files required for auth with JWT', done => {
    runner
      .runSchematicAsync('application', appOptions)
      .pipe(concatMap(tree => runner.runSchematicAsync('auth-jwt', {}, tree)))
      .subscribe(async tree => {
        expect(tree.files).toEqual(
          expect.arrayContaining([
            '/src/app/core/auth/controllers/auth.controller.ts',
            '/src/app/core/auth/controllers/auth.controller.spec.ts',
            '/src/app/core/auth/decorators/get-user.decorator.ts',
            '/src/app/core/auth/decorators/roles.decorator.ts',
            '/src/app/core/auth/decorators/roles.decorator.spec.ts',
            '/src/app/core/auth/guards/roles.guard.ts',
            '/src/app/core/auth/guards/roles.guard.spec.ts',
            '/src/app/core/auth/model/login.dto.ts',
            '/src/app/core/auth/model/roles.enum.ts',
            '/src/app/core/auth/model/user-request.interface.ts',
            '/src/app/core/auth/services/auth.service.ts',
            '/src/app/core/auth/services/auth.service.spec.ts',
            '/src/app/core/auth/strategies/jwt.strategy.ts',
            '/src/app/core/auth/strategies/jwt.strategy.spec.ts',
            '/src/app/core/auth/auth.module.ts',
            '/src/app/core/user/model/dto/user-payload.dto.ts',
            '/src/app/core/user/model/dto/create-user.dto.ts',
            '/src/app/core/user/model/entities/user.entity.ts',
            '/src/app/core/user/services/user.service.ts',
            '/src/app/core/user/services/user.service.spec.ts',
            '/src/app/core/user/user.module.ts',
          ]),
        );
        done();
      });
  });

  it('should generate and merge config files if convict is present in the project', done => {
    runner
      .runSchematicAsync('application', appOptions)
      .pipe(
        concatMap(tree =>
          runner
            .runSchematicAsync('convict', {}, tree)
            .pipe(concatMap(tree => runner.runSchematicAsync('auth-jwt', {}, tree))),
        ),
      )
      .subscribe((tree: UnitTestTree) => {
        expect(tree.files).toEqual(expect.arrayContaining(['/config/develop.json', '/config/prod.json']));
        expect(tree.readContent('/config/develop.json')).toContain(`"jwt": {
    "secret": "SECRET",
    "expiration": "24h"
  }`);
        expect(tree.readContent('/config/prod.json')).toContain(`"jwt": {
    "secret": "SECRET",
    "expiration": "24h"
  }`);
        done();
      });
  });

  it('should update config properties if convict is present in the project', done => {
    runner
      .runSchematicAsync('application', appOptions)
      .pipe(
        concatMap(tree =>
          runner
            .runSchematicAsync('convict', {}, tree)
            .pipe(concatMap(tree => runner.runSchematicAsync('auth-jwt', {}, tree))),
        ),
      )
      .subscribe((tree: UnitTestTree) => {
        expect(tree.readContent('/src/config.ts')).toContain(`jwt: {
    secret: {
      doc: 'JWT secret',
      format: String,
      default: 'SECRET',
      env: 'JWT_SECRET',
      arg: 'jwtSecret',
      secret: true,
    },
    expiration: {
      doc: 'Token expiration time',
      default: '24h',
      format: String,
      env: 'JWT_EXPIRATION',
    },
  }`);
        done();
      });
  });

  it('should import AuthModule and UserModule in CoreModule', done => {
    runner
      .runSchematicAsync('application', appOptions)
      .pipe(concatMap(tree => runner.runSchematicAsync('auth-jwt', {}, tree)))
      .subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/src/app/core/core.module.ts')).toBeDefined();
        expect(tree.readContent('/src/app/core/core.module.ts')).toContain(
          "import { AuthModule } from './auth/auth.module';",
        );
        expect(tree.readContent('/src/app/core/core.module.ts')).toContain(
          "import { UserModule } from './user/user.module';",
        );
        expect(tree.readContent('/src/app/core/core.module.ts')).toMatch(
          /imports: \[(.|\n)*(UserModule|AuthModule)(.|\n)*(UserModule|AuthModule)(.|\n)*\],/g,
        );
        done();
      });
  });
});
