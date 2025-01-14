import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Invite } from './entities/invite.entity';
import { CompaniesService } from '../companies/companies.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(Invite)
    private invitesRepository: Repository<Invite>,
    private companiesService: CompaniesService,
    private mailService: MailService,
  ) {}

  async createInvite(companyId: string, email: string): Promise<Invite> {
    const company = await this.companiesService.findOne(companyId);
    
    // Check if there's an active invite
    const existingInvite = await this.invitesRepository.findOne({
      where: {
        email,
        companyId,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (existingInvite) {
      throw new ConflictException('Active invite already exists for this email');
    }

    const invite = this.invitesRepository.create({
      email,
      companyId,
      token: uuidv4(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const savedInvite = await this.invitesRepository.save(invite);

    // Send invitation email
    await this.mailService.sendEmployeeInvite(email, {
      companyName: company.name,
      inviteToken: savedInvite.token,
    });

    return savedInvite;
  }

  async validateInvite(token: string): Promise<Invite> {
    const invite = await this.invitesRepository.findOne({
      where: {
        token,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['company'],
    });

    if (!invite) {
      throw new NotFoundException('Invalid or expired invite');
    }

    return invite;
  }

  async useInvite(token: string, userId: string): Promise<void> {
    const invite = await this.validateInvite(token);
    
    await this.companiesService.addEmployee(invite.companyId, userId);
    
    invite.used = true;
    await this.invitesRepository.save(invite);
  }
}
