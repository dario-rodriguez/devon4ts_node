import {
  Tree,
  addDependenciesToPackageJson,
  generateFiles,
  installPackagesTask,
  readProjectConfiguration,
} from '@nx/devkit';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { ensureConfigFile } from '../../utils/config/config-defaults';
import { mergeDockerCompose } from '../../utils/merge';
import { ensureProjectIsAnApplication, existsConvictConfig, getNpmScope } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';
import { defaultMailerValues, mailerConfigFile, mailerConfigType, mailerValuesFromConfig } from './configvalues';
import { MailerGeneratorSchema } from './schema';

export async function mailerGenerator(tree: Tree, options: MailerGeneratorSchema): Promise<() => void> {
  const appConfig = readProjectConfiguration(tree, options.projectName);

  ensureProjectIsAnApplication(appConfig);

  addDependenciesToPackageJson(
    tree,
    {
      [packagesVersion['devon4tsMailer'].name]: packagesVersion['devon4tsMailer'].version,
      [packagesVersion['handlebars'].name]: packagesVersion['handlebars'].version,
    },
    {},
  );
  const projectRoot = appConfig.root;
  addMailerToProject(tree, projectRoot);
  generateFiles(tree, path.join(__dirname, 'files/assets'), path.join(projectRoot, 'src/assets'), options);
  mergeDockerCompose(tree, (await readFile(path.join(__dirname, 'files/docker-compose.yml.template'))).toString());
  return () => {
    installPackagesTask(tree);
  };
}

export default mailerGenerator;

function addMailerToCoreModule(tree: Tree, existsConfig: boolean, projectRoot: string): void {
  const corePath = `${projectRoot}/src/app/core/core.module.ts`;
  if (!tree.exists(corePath)) {
    return;
  }

  const coreContent = new ASTFileBuilder(tree.read(corePath)!.toString());

  if (coreContent.build().includes('MailerModule')) {
    return;
  }

  coreContent
    .addImports('MailerModule', '@devon4ts/mailer')
    .addImports('join', 'path')
    .addToModuleDecorator(
      'CoreModule',
      'MailerModule.register(' + (existsConfig ? mailerValuesFromConfig : defaultMailerValues) + ')',
      'imports',
    )
    ?.addToModuleDecorator('CoreModule', 'MailerModule', 'exports');

  if (coreContent) {
    tree.write(corePath, coreContent.build());
  }
}

function addMailerToProject(tree: Tree, projectRoot: string): Tree {
  const config = existsConvictConfig(tree, projectRoot);

  if (!config) {
    addMailerToCoreModule(tree, false, projectRoot);
    return tree;
  }

  ensureConfigFile(tree, projectRoot, getNpmScope(tree));
  addMailerToCoreModule(tree, true, projectRoot);

  // Add properties to config type file
  const configTypeFile = `${projectRoot}/src/app/app-config.ts`;
  const configTypeFileContent = new ASTFileBuilder(tree.read(configTypeFile)!.toString('utf-8'))
    .addPropToInterface('AppConfig', 'mailer', mailerConfigType)
    .build();
  tree.write(configTypeFile, configTypeFileContent);

  // Add properties to config file
  const configFile = `${projectRoot}/src/config.ts`;
  const configFileContent = new ASTFileBuilder(tree.read(configFile)!.toString('utf-8'))
    .addPropertyToDefaultExportObjectLiteralParam(0, 'mailer', mailerConfigFile)
    .build();
  tree.write(configFile, configFileContent);
  return tree;
}
