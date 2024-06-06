import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { AuthUser } from '../decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google')
  async googleAuth(@Body('token') token: string, @Res() res: Response) {
    const googleUser = await this.authService.verifyGoogleToken(token);
    if (googleUser) {
      const jwtToken = await this.authService.signIn(googleUser);
      return res.json({ access_token: jwtToken });
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProtected(@Req() req, @AuthUser() user: any) {
    return user;
  }
}
