import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/models/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
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
    const payload = ticket.getPayload();
    console.log({ email: payload.email });
    const user = await this.userRepository.findOne({ email: payload.email });
    console.log('user', user);
    if (!user) {
      console.log('user not exitst');
      await this.userRepository.create(payload);
    }
    return payload;
  }

  async signIn(user: any) {
    const payload = { email: user.email, sub: user.userId };
    return this.jwtService.sign(payload, { secret: 'secret' });
  }
}
