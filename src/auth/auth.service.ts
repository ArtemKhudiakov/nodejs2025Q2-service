import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async signup(signupDto: SignupDto) {
    const { login, password } = signupDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      throw new BadRequestException('User with this login already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        login,
        password: hashedPassword,
      },
    });

    const { password: _password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      createdAt: userWithoutPassword.createdAt.getTime(),
      updatedAt: userWithoutPassword.updatedAt.getTime(),
    };
  }

  async login(loginDto: LoginDto) {
    const { login, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    const accessToken = await this.generateAccessToken(user.id, user.login);
    const refreshToken = await this.generateRefreshToken(user.id, user.login);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshDto: RefreshDto) {
    const { refreshToken } = refreshDto;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new ForbiddenException('Invalid refresh token');
    }

    // Проверка срока действия
    if (storedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
      throw new ForbiddenException('Refresh token expired');
    }

    const { user } = storedToken;

    // Генерация новой пары токенов
    const newAccessToken = await this.generateAccessToken(user.id, user.login);
    const newRefreshToken = await this.generateRefreshToken(
      user.id,
      user.login,
    );

    // Удаление старого refresh token
    await this.prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async generateAccessToken(userId: string, login: string): Promise<string> {
    const payload = { userId, login };
    return this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(userId: string, login: string): Promise<string> {
    const payload = { userId, login };
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const expiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';

    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresIn as any,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }

  async validateUser(userId: string, login: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.login !== login) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }
}
