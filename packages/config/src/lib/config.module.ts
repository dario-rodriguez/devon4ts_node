import { DynamicModule, Module } from '@nestjs/common';
import { BaseConfig } from './base-config';
import {
  CONFIG_OPTIONS_PROVIDER_NAME,
  CONFIG_VALIDATION_PROVIDER_NAME,
  CONFIG_VALUES_PROVIDER_NAME,
} from './config.constants';
import { ConfigService } from './config.service';
import { ConfigModuleOptions } from './config.types';

@Module({})
export class ConfigModule {
  private static defaultOptions: Partial<ConfigModuleOptions> = {
    configDir: './dist/config',
    configType: BaseConfig,
  };

  private static getValidate(): boolean {
    return !!(
      process.env['VALIDATE_CONFIG'] &&
      (process.env['VALIDATE_CONFIG'].toLowerCase() === 'true' ||
        process.env['VALIDATE_CONFIG'].toLowerCase() === 'yes')
    );
  }

  static register(options?: Omit<Partial<ConfigModuleOptions>, 'validate'>): DynamicModule {
    const mergedOptions = { ...this.defaultOptions, ...options };
    return {
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG_OPTIONS_PROVIDER_NAME,
          useValue: mergedOptions,
        },
        {
          provide: CONFIG_VALUES_PROVIDER_NAME,
          useFactory: async (): Promise<any> => {
            if (!mergedOptions.configDir) {
              throw new Error('configDir is required to configure the ConfigModule');
            }
            return await ConfigService.loadConfigFromFile(mergedOptions.configDir);
          },
        },
        {
          provide: CONFIG_VALIDATION_PROVIDER_NAME,
          useFactory: (): (() => boolean) => {
            return ConfigModule.getValidate;
          },
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}
