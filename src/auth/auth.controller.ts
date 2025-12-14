import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    if (!signupDto.login || !signupDto.password) {
      throw new BadRequestException('Login and password are required');
    }

    if (
      typeof signupDto.login !== 'string' ||
      typeof signupDto.password !== 'string'
    ) {
      throw new BadRequestException('Login and password must be strings');
    }

    return this.authService.signup(signupDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    if (!loginDto.login || !loginDto.password) {
      throw new BadRequestException('Login and password are required');
    }

    if (
      typeof loginDto.login !== 'string' ||
      typeof loginDto.password !== 'string'
    ) {
      throw new BadRequestException('Login and password must be strings');
    }

    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshDto) {
    if (!refreshDto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    if (typeof refreshDto.refreshToken !== 'string') {
      throw new UnauthorizedException('Refresh token must be a string');
    }

    return this.authService.refresh(refreshDto);
  }
}
