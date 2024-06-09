import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/models/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private client: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly userRepository: Model<User>,
  ) {
    this.client = new OAuth2Client({
      clientId: process.env.clientID,
      clientSecret: process.env.clientSecret,
    });
  }

  async verifyGoogleToken(token: string) {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: process.env.clientID,
    });
    return ticket.getPayload();
  }

  async findOrCreateUser(payload: TokenPayload) {
    const user = await this.userRepository.findOne({ email: payload.email });
    if (!user) {
      console.log(
        `User not exist with email ${payload.email}, creating new user...`,
      );
      return this.userRepository.create(payload);
    }
    this.logger.debug(`Found user: ${user.email}`);
    return user;
  }

  async signIn(user: any) {
    const payload = { email: user.email, sub: user.userId };
    return this.jwtService.sign(payload, { secret: 'secret' });
  }
}
