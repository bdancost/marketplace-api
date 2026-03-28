import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { UserStatus } from '../users/enums/user-status.enum';
import { User } from '../users/entities/user.entity';

// ✅ mock explícito
jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;

  let usersService: {
    findByEmail: jest.Mock<Promise<User | null>, [string]>;
    findByEmailWithPassword: jest.Mock<Promise<User | null>, [string]>;
    create: jest.Mock<Promise<User>, [any]>;
  };

  let jwtService: {
    sign: jest.Mock<string, [any]>;
  };

  const mockHash = bcrypt.hash as jest.Mock;
  const mockCompare = bcrypt.compare as jest.Mock;

  const registerDto: RegisterDto = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'João',
    lastName: 'Silva',
    role: UserRole.BUYER,
  };

  const mockUser: User = {
    id: 'uuid-123',
    email: registerDto.email,
    password: '$2a$10$hashedpassword',
    firstName: registerDto.firstName,
    lastName: registerDto.lastName,
    role: UserRole.BUYER,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn<Promise<User | null>, [string]>(),
      findByEmailWithPassword: jest.fn<Promise<User | null>, [string]>(),
      create: jest.fn<Promise<User>, [any]>(),
    };

    jwtService = {
      sign: jest.fn<string, [any]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      mockHash.mockResolvedValue('$hashed');
      usersService.create.mockResolvedValue(mockUser);

      const result = await authService.register(registerDto);

      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockCompare.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token');

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        user: mockUser,
        token: 'token',
      });
    });

    it('should throw UnauthorizedException (email)', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException (password)', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockCompare.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
