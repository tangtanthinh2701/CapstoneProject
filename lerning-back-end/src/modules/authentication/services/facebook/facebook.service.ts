import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import { ERROR_MESSAGES } from 'src/common/constants/messages.constants';
import { ROUTES } from 'src/common/constants/routes.constants';
import { LogMethod } from 'src/common/decorators/log-method.decorator';

import { GetFaceBookDto } from '../../dto/get-facebook-profile.dto';

@Injectable()
export class FacebookService {
  constructor(private httpService: HttpService) {}
  @LogMethod()
  async getFacebookProfile(token: string): Promise<GetFaceBookDto> {
    try {
      const fbUrl = `${ROUTES.AUTHENTICATION.GET_FACEBOOK_PROFILE}&access_token=${token}`;
      const response = await lastValueFrom(
        this.httpService.get<GetFaceBookDto>(fbUrl),
      );
      return response.data;
    } catch (_error) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTHENTICATION.INVALID_FACEBOOK_TOKEN,
      );
    }
  }
}
