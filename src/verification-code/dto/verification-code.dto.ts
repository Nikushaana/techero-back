import { Matches, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class PhoneDto {
  @IsString()
  @Matches(/^5[0-9]{8}$/, {
    message: 'Phone number must start with 5 and be 9 digits long',
  })
  phone: string;
}

export class VerifyCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @Matches(/^5[0-9]{8}$/, {
    message: 'Phone number must start with 5 and be 9 digits long',
  })
  phone: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @Matches(/^5[0-9]{8}$/, {
    message: 'Phone number must start with 5 and be 9 digits long',
  })
  phone: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ChangeNumberDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @Matches(/^5[0-9]{8}$/, {
    message: 'Phone number must start with 5 and be 9 digits long',
  })
  phone: string;
}
