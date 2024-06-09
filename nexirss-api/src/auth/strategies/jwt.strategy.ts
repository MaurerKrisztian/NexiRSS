import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { User } from '../../user/models/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as process from 'node:process';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(@InjectModel(User.name) private userRepository: Model<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.jwt_secret || 'secret',
    });
  }

  async validate(payload: JwtPayload) {
    this.logger.verbose(`Validate user: ${payload.email}`);
    const user = await this.userRepository.findOne({
      email: payload.email,
    });

    if (!user) throw new UnauthorizedException('Please log in to continue');

    return user;
  }
}
