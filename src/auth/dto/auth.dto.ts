import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class
    LoginDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    password_hash?: string;
}

export class RegisterDto extends LoginDto {
    @ApiProperty({ example: 'John' })
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(50, { message: 'Last name cannot exceed 50 characterame cannot exceed 50 characters' })
    name: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(32, { message: 'Password cannot exceed 32 characters' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        }
    )
    password: string;
}


export class RefreshTokenDto {
    refreshToken: string;
}