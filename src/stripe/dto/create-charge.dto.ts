import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChargeDto {
  @ApiProperty({ example: 1000, description: 'Amount in cents' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'usd', description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 'tok_visa', description: 'Stripe source token' })
  @IsString()
  @IsNotEmpty()
  source: string;
}