import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return users.map(({ password: _password, ...user }) => ({
      ...user,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    }));
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        login: createUserDto.login,
        password: hashedPassword,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = newUser;
    return {
      ...userWithoutPassword,
      createdAt: userWithoutPassword.createdAt.getTime(),
      updatedAt: userWithoutPassword.updatedAt.getTime(),
    };
  }

  async update(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверка старого пароля
    const isOldPasswordValid = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new ForbiddenException('Old password is wrong');
    }

    // Хеширование нового пароля
    const hashedNewPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      10,
    );

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword,
        version: {
          increment: 1,
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = updatedUser;
    return {
      ...userWithoutPassword,
      createdAt: userWithoutPassword.createdAt.getTime(),
      updatedAt: userWithoutPassword.updatedAt.getTime(),
    };
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }
}
