import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

interface GoogleUser {
    email: string;
    google_id: string;
}

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const newUser = this.usersRepository.create({
            name: createUserDto.name,
            email: createUserDto.email,
            password_hash: createUserDto.password,
            role: 'user',
        });

        return await this.usersRepository.save(newUser);
    }

    async findAll(): Promise<User[]> {
        return await this.usersRepository.find();
    }

    async findOne(id: string): Promise<User | null> {
        return await this.usersRepository.findOneBy({ id: Number(id) });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOneBy({ email });
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        return await this.usersRepository.findOneBy({ google_id: googleId });
    }

    async findById(id: number): Promise<User | null> {
        return await this.usersRepository.findOneBy({ id });
    }

    async update(id: number, updateData: Partial<User>): Promise<User | null> {
        const user = await this.findById(id);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        await this.usersRepository.update(id, updateData);
        return this.findById(id);
    }

    async remove(id: number): Promise<void> {
        const user = await this.findById(id);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        await this.usersRepository.delete(id);
    }

    async validateUser(email: string, googleId: string): Promise<User> {
        const user = await this.findByEmail(email);

        if (!user || user.google_id !== googleId) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }
}