import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { packagesVersion } from '../../../src/lib/packagesVersion';

describe('Swagger Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(__dirname, '../../../src/collection.json'),
  );

  it('should throw an error if not executed at project root folder', async () => {
    try {
      await runner.runSchematic('swagger', { name: 'foo' });
      fail();
    } catch (error) {
      expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
    }
  });

  it('should generate the files', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('swagger', {}, tree);

    expect(tree?.files).toEqual(expect.arrayContaining(['/config/prod.json', '/config/develop.json']));
  });

  it('should update package.json to add swagger dependencies', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('swagger', {}, tree);

    expect(tree?.readContent('/package.json')).toContain(`"${packagesVersion['nestjsSwagger'].packageName}": `);
  });

  it('should update main.ts to initialize swagger', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('swagger', {}, tree);

    const main = tree?.readContent('/src/main.ts');
    expect(main).toContain(`import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'`);
    expect(main).toContain(`const swaggerDoc = SwaggerModule.createDocument(app, options);`);
    expect(main).toContain(`SwaggerModule.setup('v1/api', app, swaggerDoc);`);
  });

  it('should initalize swagger with convict configuration if present in the project', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('convict', {}, tree);
    tree = await runner.runSchematic('swagger', {}, tree);

    const main = tree?.readContent('/src/main.ts');
    expect(main).toContain(`import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'`);
    expect(main).toContain(`const swaggerDoc = SwaggerModule.createDocument(app, options);`);
    expect(main).toContain(`const swaggerDoc = SwaggerModule.createDocument(app, options);`);
    expect(main).toContain(`config.swagger?.title`);
  });

  it('should update nest-cli.json to enable swagger plugin', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('swagger', {}, tree);

    expect(tree?.readContent('/nest-cli.json')).toMatch(
      /"compilerOptions": \{(.|\n)*"plugins": \[(.|\n)*"@nestjs\/swagger"(.|\n)*\](.|\n)*\}/g,
    );
  });

  it('should initalize swagger with convict configuration if present in the project', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('convict', {}, tree);
    tree = await runner.runSchematic('swagger', {}, tree);

    const main = tree?.readContent('/src/main.ts');
    expect(main).toContain(`import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'`);
    expect(main).toContain(`const swaggerDoc = SwaggerModule.createDocument(app, options);`);
    expect(main).toContain(`const swaggerDoc = SwaggerModule.createDocument(app, options);`);
    expect(main).toContain(`config.swagger?.title`);
  });

  it('should update base-entity to add swagger decorators', async () => {
    let tree = await runner.runSchematic('application', { name: '' });
    tree = await runner.runSchematic('typeorm', { db: 'postgres' }, tree);
    tree = await runner.runSchematic('swagger', {}, tree);

    const baseEntity = tree?.readContent('/src/app/shared/model/entities/base.entity.ts');
    expect(baseEntity).toContain(`import { ApiHideProperty } from '@nestjs/swagger'`);
    expect(baseEntity).toMatch(/@ApiHideProperty\(\)\n *version/g);
    expect(baseEntity).toMatch(/@ApiHideProperty\(\)\n *createdAt/g);
    expect(baseEntity).toMatch(/@ApiHideProperty\(\)\n *updatedAt/g);
  });
});
