import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuestStrategy extends PassportStrategy(Strategy, 'GUEST') {
  validate() {
    console.log('guest');
    return {};
  }
}
