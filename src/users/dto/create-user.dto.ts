export class CreateUserDto {
  name: string;
  email: string;
  password?: string;
  linkedin_id?: string;
  google_id?: string;
}