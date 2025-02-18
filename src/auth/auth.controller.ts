// src/auth/auth.controller.ts
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/auth.guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('verify-token')
  async verifyToken(@Body('token') token: string) {
    return this.authService.verifyToken(token);
  }

  // Google endpoints
  @Post('google-signin')
  async googleSignin(@Body('tokenId') tokenId: string) {
    return this.authService.googleLogin(tokenId);
  }

  @Post('google-signup')
  async googleSignup(@Body('tokenId') tokenId: string) {
    return this.authService.googleLogin(tokenId);
  }

  // New endpoint for Google OAuth callback
  @Post('google-callback')
  async googleCallback(@Body('code') code: string) {
    return this.authService.googleCallback(code);
  }

  // LinkedIn endpoints
  @Post('linkedin-signin')
  async linkedinSignin(@Body('accessToken') accessToken: string) {
    return this.authService.linkedinLogin(accessToken);
  }

  @Post('linkedin-signup')
  async linkedinSignup(@Body('accessToken') accessToken: string) {
    return this.authService.linkedinLogin(accessToken);
  }

  // New endpoint for LinkedIn OAuth callback
  @Post('linkedin-callback')
  async linkedinCallback(@Body('code') code: string) {
    return this.authService.linkedinCallback(code);
  }
  // Forgot Password endpoint
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  // Reset Password endpoint
  @Post('reset-password')
  async resetPassword(
    @Body() body: { token: string; newPassword: string },
  ) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

    // Get account details by email (in production, protect with auth guard)
    @Get('account/details')
    @UseGuards(JwtAuthGuard)
    async getAccountDetails(@Query('email') email: string) {
      return this.authService.getAccountDetails(email);
    }
  
    // Update account details (email is read-only)
    @Post('account/update')
    @UseGuards(JwtAuthGuard)
    async updateAccount(@Body() payload: any) {
      return this.authService.updateAccountDetails(payload);
    }

}