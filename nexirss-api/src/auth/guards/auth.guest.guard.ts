import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuestGuard extends AuthGuard('GUEST') {}
