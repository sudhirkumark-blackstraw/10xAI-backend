import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { User } from 'src/users/user.entity';
import { OAuth2Client } from 'google-auth-library';
import { MailService } from '../mail/mail.service';
import axios from 'axios';

@Injectable()
export class AuthService {

  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {
    this.googleClient = new OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: LoginDto) {
    const validUser = await this.validateUser(user.email, user.password);
    if (!validUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: validUser.email, userId: validUser.id, userName: validUser.name };
    return {
      token: this.generateToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      user: payload,
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const payload = { email: user.email, userId: user.id, userName: user.name };
    return {
      token: this.generateToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      payload,
    };
  }


  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.usersService.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const newPayload = { email: user.email, userId: user.id, userName: user.name };
      return {
        token: this.generateToken(payload),
        refreshToken: this.generateRefreshToken(newPayload),
        user,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      const user = await this.usersService.findOne(payload.userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return { email: user.email, userId: user.id, userName: user.name };
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async googleLogin(idToken: string) {
    let ticket;
    try {
      ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedException('Invalid Google token payload');
    }
    const { email, name, userId: googleId } = payload;
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.create({
        name: name,
        email: email,
        password: '', // For social login, password can be empty
        google_id: googleId,
      });
    }
    const payloadForJwt = { email: user.email, userId: user.id };
    return {
      token: this.generateToken(payloadForJwt),
      refreshToken: this.generateRefreshToken(payloadForJwt),
      user,
    };
  }

  async googleCallback(code: string) {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI');
    try {
      // Exchange code for tokens
      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        null,
        {
          params: {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      const idToken = tokenResponse.data.id_token;
      if (!idToken) {
        throw new UnauthorizedException('No ID token received from Google');
      }
      return this.googleLogin(idToken);
    } catch (error) {
      throw new UnauthorizedException('Google code exchange failed');
    }
  }

  async linkedinLogin(accessToken: string) {
    try {
      // Fetch profile info from LinkedIn
      const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const emailResponse = await axios.get(
        'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const firstName = profileResponse.data.localizedFirstName;
      const lastName = profileResponse.data.localizedLastName;
      const fullName = `${firstName} ${lastName}`;
      const email = emailResponse.data.elements[0]['handle~'].emailAddress;
      const linkedinId = profileResponse.data.id;

      let user = await this.usersService.findByEmail(email);
      if (!user) {
        user = await this.usersService.create({
          name: fullName,
          email: email,
          password: '',
          linkedin_id: linkedinId,
        });
      }
      const payloadForJwt = { email: user.email, userId: user.id };
      return {
        token: this.generateToken(payloadForJwt),
        refreshToken: this.generateRefreshToken(payloadForJwt),
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid LinkedIn token or error fetching profile');
    }
  }

  // LinkedIn callback: exchange authorization code for access token, then login.
  async linkedinCallback(code: string) {
    const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
    const clientSecret = this.configService.get('LINKEDIN_CLIENT_SECRET');
    const redirectUri = this.configService.get('LINKEDIN_REDIRECT_URI');
    try {
      const tokenResponse = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        null,
        {
          params: {
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      const accessToken = tokenResponse.data.access_token;
      return this.linkedinLogin(accessToken);
    } catch (error) {
      throw new UnauthorizedException('LinkedIn code exchange failed');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    // Always return the same message to prevent email enumeration.
    const message = 'If that email exists, a password reset link has been sent.';
    if (!user) {
      return { message };
    }
    const payload = { userId: user.id, email: user.email };
    const resetToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_RESET_SECRET'),
      expiresIn: '1h',
    });
    const frontendUrl = this.configService.get('FRONTEND_URL'); // e.g., https://yourdomain.com
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Load the "forgot-password" email template and compile it.
    const html = this.mailService.loadTemplate('forgot-password', {
      name: user.name,
      resetLink,
    });
    await this.mailService.sendMail(user.email, 'Password Reset', html);
    return { message };
  }

  // --- Reset Password ---
  async resetPassword(token: string, newPassword: string) {
    let payload;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_RESET_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }
    const user = await this.usersService.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // Hash the new password and update the user record.
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, { password_hash: hashedPassword });
    return { message: 'Password has been reset successfully' };
  }

  private generateRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
  }
  private generateToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '7d',
    });
  }

  async getAccountDetails(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  // Update account details (email is not updated)
  async updateAccountDetails(payload: any) {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // Update fields – note that we update the "name" field with primaryContact.
    const updateData = {
      name: payload.primaryContact,
      company_name: payload.companyName,
      company_website: payload.companyWebsite,
      job_title: payload.jobTitle,
      industry: payload.industry,
      company_size: payload.companySize,
      phone: payload.phone,
      location: payload.location,
      linkedin_profile: payload.linkedIn,
    };
    const updatedUser = await this.usersService.update(user.id, updateData);
    return { message: "Account details updated successfully", user: updatedUser };
  }
}