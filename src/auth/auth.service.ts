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
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { login, password } = signupDto;

    // Проверка существования пользователя
    const existingUser = await this.prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      throw new BadRequestException('User with this login already exists');
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await this.prisma.user.create({
      data: {
        login,
        password: hashedPassword,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      createdAt: userWithoutPassword.createdAt.getTime(),
      updatedAt: userWithoutPassword.updatedAt.getTime(),
    };
  }

  async login(loginDto: LoginDto) {
    const { login, password } = loginDto;

    // Поиск пользователя
    const user = await this.prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    // Генерация Access токена
    const accessToken = await this.generateAccessToken(user.id, user.login);

    return {
      accessToken,
    };
  }

  async generateAccessToken(userId: string, login: string): Promise<string> {
    const payload = { userId, login };
    return this.jwtService.signAsync(payload);
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

