import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { concatMap } from 'rxjs/operators';
import { packagesVersion } from '../packagesVersion';

describe('Swagger Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('swagger', { name: 'foo' }).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should generate the files', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('swagger', {}, tree)))
      .subscribe(tree => {
        expect(tree.files).toEqual(expect.arrayContaining(['/config/prod.json', '/config/develop.json']));
        done();
      });
  });

  it('should update package.json to add swagger dependencies', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('swagger', {}, tree)))
      .subscribe(tree => {
        expect(tree.readContent('/package.json')).toContain(`"${packagesVersion.nestjsSwagger.packageName}": `);
        done();
      });
  });

  it('should update main.ts to initialize swagger', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('swagger', {}, tree)))
      .subscribe(tree => {
        const main = tree.readContent('/src/main.ts');
        expect(main).toContain(`import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'`);
        expect(main).toContain(`const swaggerDoc = SwaggerModule.createDocument(app, options);`);
        expect(main).toContain(`SwaggerModule.setup('v1/api', app, swaggerDoc);`);

        done();
      });
  });

  it('should initalize swagger with convict configuration if present in the project', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree =>
          runner
            .runSchematicAsync('convict', {}, tree)
            .pipe(concatMap(tree => runner.runSchematicAsync('swagger', {}, tree))),
        ),
      )
      .subscribe(tree => {
        const main = tree.readContent('/src/main.ts');
        expect(main).toContain(`import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'`);
        expect(main).toContain(`const swaggerDoc = SwaggerModule.createDocument(app, options);`);
        expect(main).toContain(`const swaggerDoc = SwaggerModule.createDocument(app, options);`);
        expect(main).toContain(`config.swagger?.title`);

        done();
      });
  });

  it('should update nest-cli.json to enable swagger plugin', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(concatMap(tree => runner.runSchematicAsync('swagger', {}, tree)))
      .subscribe(tree => {
        expect(tree.readContent('/nest-cli.json')).toMatch(
          /"compilerOptions": \{(.|\n)*"plugins": \[(.|\n)*"@nestjs\/swagger"(.|\n)*\](.|\n)*\}/g,
        );

        done();
      });
  });

  it('should initalize swagger with convict configuration if present in the project', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree =>
          runner
            .runSchematicAsync('convict', {}, tree)
            .pipe(concatMap(tree => runner.runSchematicAsync('swagger', {}, tree))),
        ),
      )
      .subscribe(tree => {
        const main = tree.readContent('/src/main.ts');
        expect(main).toContain(`import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'`);
        expect(main).toContain(`const swaggerDoc = SwaggerModule.createDocument(app, options);`);
        expect(main).toContain(`const swaggerDoc = SwaggerModule.createDocument(app, options);`);
        expect(main).toContain(`config.swagger?.title`);

        done();
      });
  });

  it('should update base-entity to add swagger decorators', done => {
    runner
      .runSchematicAsync('application', { name: '' })
      .pipe(
        concatMap(tree =>
          runner
            .runSchematicAsync('typeorm', { db: 'postgres' }, tree)
            .pipe(concatMap(tree => runner.runSchematicAsync('swagger', {}, tree))),
        ),
      )
      .subscribe(tree => {
        const baseEntity = tree.readContent('/src/app/shared/model/entities/base.entity.ts');
        expect(baseEntity).toContain(`import { ApiHideProperty } from '@nestjs/swagger'`);
        expect(baseEntity).toMatch(/@ApiHideProperty\(\)\n *version/g);
        expect(baseEntity).toMatch(/@ApiHideProperty\(\)\n *createdAt/g);
        expect(baseEntity).toMatch(/@ApiHideProperty\(\)\n *updatedAt/g);

        done();
      });
  });
});
