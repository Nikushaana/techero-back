import { Matches, MinLength, IsString, IsNotEmpty, IsIn, ValidateIf } from 'class-validator';

export class RegisterIndAdmTechDelDto {
  @IsString()
  @Matches(/^5[0-9]{8}$/, {
    message: 'Phone number must start with 5 and be 9 digits long',
  })
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
