import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { BaseConfig } from '../src';

class NestedTypes {
  @IsString()
  @IsOptional()
  type?: string;
  @IsString()
  @IsOptional()
  @IsUrl()
  url?: string;
  @IsString()
  @IsOptional()
  value?: string;
}

export class TestTypes extends BaseConfig {
  @ValidateNested()
  @Type(() => NestedTypes)
  nested?: NestedTypes;
}
