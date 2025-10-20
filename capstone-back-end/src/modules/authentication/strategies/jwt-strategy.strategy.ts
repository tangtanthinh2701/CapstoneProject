import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { configuration } from 'src/configs/configuration';

import { AccessTokenPayload } from '../types/access-token-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuration.authentication.accessToken,
    });
  }

  validate(payload: AccessTokenPayload) {
    return payload;
  }
}
