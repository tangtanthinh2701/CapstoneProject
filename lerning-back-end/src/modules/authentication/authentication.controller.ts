import { Body, Controller, Post } from '@nestjs/common';
import { SUCCESS_MESSAGES } from 'src/common/constants/messages.constants';
import { LogMethod } from 'src/common/decorators/log-method.decorator';

import { AuthenticationService } from './authentication.service';
import { Public } from './decorators/public.decorator';
import { ResponseMessage } from './decorators/response-message.decorator';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('login')
  @Public()
  @ResponseMessage(SUCCESS_MESSAGES.AUTHENTICATION.LOGIN)
  @LogMethod()
  async login(@Body() loginDto: LoginDto) {
    const res = await this.authenticationService.login(loginDto);
    return res;
  }

  @Post('sign-up')
  @Public()
  @ResponseMessage(SUCCESS_MESSAGES.AUTHENTICATION.SIGN_UP)
  @LogMethod()
  async signUp(@Body() signUpDto: SignUpDto) {
    const res = await this.authenticationService.signUp(signUpDto);
    return res;
  }
}
