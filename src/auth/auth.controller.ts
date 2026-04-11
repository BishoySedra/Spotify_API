import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Redirect to Spotify login page' })
  @Get('login')
  login(@Res() res: Response) {
    const url = this.authService.getAuthorizationUrl();
    res.redirect(url);
  }

  @ApiOperation({
    summary: 'Spotify OAuth callback — exchanges code for tokens',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Authorization code from Spotify',
  })
  @Get('callback')
  async callback(@Query('code') code: string) {
    const tokens = await this.authService.exchangeCode(code);

    return {
      message:
        'Authentication successful. Use the access_token as your Bearer token.',
      ...tokens,
    };
  }

  @ApiOperation({ summary: 'Refresh an expired access token' })
  @ApiQuery({ name: 'refresh_token', required: true })
  @Get('refresh')
  async refresh(@Query('refresh_token') refreshToken: string) {
    const tokens = await this.authService.refreshAccessToken(refreshToken);

    return {
      message: 'Token refreshed successfully.',
      ...tokens,
    };
  }
}
