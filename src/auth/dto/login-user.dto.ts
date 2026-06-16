import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @Matches(/^5[0-9]{8}$/, {
    message: 'Phone number must start with 5 and be 9 digits long',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
