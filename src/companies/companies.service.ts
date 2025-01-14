import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    private usersService: UsersService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, userId: string): Promise<Company> {
    const existingCompany = await this.companiesRepository.findOne({
      where: [
        { cnpj: createCompanyDto.cnpj },
        { corporateEmail: createCompanyDto.corporateEmail },
      ],
    });

    if (existingCompany) {
      throw new ConflictException('Company already exists');
    }

    const company = this.companiesRepository.create({
      ...createCompanyDto,
      isActive: true,
    });

    const savedCompany = await this.companiesRepository.save(company);

    // Update user as company admin
    await this.usersService.updateRole(userId, 'COMPANY_ADMIN', savedCompany.id);

    return savedCompany;
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: ['employees'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async addEmployee(companyId: string, userId: string): Promise<void> {
    const company = await this.findOne(companyId);
    const user = await this.usersService.findById(userId);

    if (company.maxEmployees && company.employees.length >= company.maxEmployees) {
      throw new ConflictException('Maximum number of employees reached');
    }

    await this.usersService.updateRole(userId, 'EMPLOYEE', companyId);
  }

  async removeEmployee(companyId: string, userId: string): Promise<void> {
    const company = await this.findOne(companyId);
    const user = await this.usersService.findById(userId);

    if (user.role === 'COMPANY_ADMIN') {
      throw new ConflictException('Cannot remove company admin');
    }

    await this.usersService.updateRole(userId, 'INDIVIDUAL', null);
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.find();
  }
}
