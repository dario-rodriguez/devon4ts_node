import { Controller } from '@nestjs/common';
import { Handler } from '../../src/lib/decorators/handler.decorator';

jest.mock('@nestjs/common');

describe('Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register the handler without parameters', () => {
    Handler();

    expect(Controller).toBeCalled();
    expect(Controller).toBeCalledWith(undefined);
  });

  it('should register the handler with the provided parameters', () => {
    const input = 'name';
    Handler(input);

    expect(Controller).toBeCalled();
    expect(Controller).toBeCalledWith(input);
  });
});
