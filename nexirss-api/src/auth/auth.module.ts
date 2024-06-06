import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuestGuard } from './guards/auth.guest.guard';
import { AuthGuestStrategy } from './strategies/guest.strategy';

@Module({
  imports: [],
  providers: [
    JwtAuthGuard,
    JwtStrategy,
    AuthGuestGuard,
    AuthGuestStrategy,
    AuthService,
    JwtService,
  ],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
