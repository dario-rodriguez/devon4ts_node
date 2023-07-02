import { Test } from '@nestjs/testing';
import { MAILER_OPTIONS_PROVIDER_NAME, MailerModule, MailerModuleOptions, MailerService } from '../src';
describe('MailerModule', () => {
  it('should register the module and make MailerService available', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MailerModule.register()],
    }).compile();

    const service = moduleRef.get(MailerService);
    expect(service).toBeDefined();
  });

  it('should register the module and make MailerService available', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MailerModule.register()],
    }).compile();

    const service = moduleRef.get(MailerService);
    const options = moduleRef.get(MAILER_OPTIONS_PROVIDER_NAME);

    expect(service).toBeDefined();
    expect(options).toStrictEqual({
      hbsOptions: {
        templatesDir: './templates/views',
      },
      mailOptions: { streamTransport: true, newline: 'windows' },
      emailFrom: 'noreply@capgemini.com',
    });
  });

  it('should register the module with the provided options', async () => {
    const input: MailerModuleOptions = {
      hbsOptions: {
        templatesDir: 'test',
      },
      mailOptions: {
        streamTransport: true,
        newline: 'test',
      },
      emailFrom: 'test@test.test',
    };
    const moduleRef = await Test.createTestingModule({
      imports: [MailerModule.register(input)],
    }).compile();

    const service = moduleRef.get(MailerService);
    const options = moduleRef.get(MAILER_OPTIONS_PROVIDER_NAME);

    expect(service).toBeDefined();
    expect(options).toStrictEqual(input);
  });

  it('should register the module using the provided factory', async () => {
    const input: MailerModuleOptions = {
      hbsOptions: {
        templatesDir: 'test',
      },
      mailOptions: {
        streamTransport: true,
        newline: 'test',
      },
      emailFrom: 'test@test.test',
    };
    const moduleRef = await Test.createTestingModule({
      imports: [
        MailerModule.registerAsync({
          useFactory: () => {
            return input;
          },
        }),
      ],
    }).compile();

    const service = moduleRef.get(MailerService);
    const options = moduleRef.get(MAILER_OPTIONS_PROVIDER_NAME);

    expect(service).toBeDefined();
    expect(options).toStrictEqual(input);
  });
});
