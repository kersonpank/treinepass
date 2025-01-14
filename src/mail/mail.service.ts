import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST'),
      port: configService.get('SMTP_PORT'),
      secure: configService.get('SMTP_SECURE'),
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmployeeInvite(email: string, data: { companyName: string; inviteToken: string }) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const inviteUrl = `${frontendUrl}/register?token=${data.inviteToken}`;

    await this.transporter.sendMail({
      from: `"TreinePass" <${this.configService.get('SMTP_FROM')}>`,
      to: email,
      subject: `Convite para juntar-se à ${data.companyName} no TreinePass`,
      html: `
        <h1>Bem-vindo ao TreinePass!</h1>
        <p>Você foi convidado para se juntar à ${data.companyName} na plataforma TreinePass.</p>
        <p>Com o TreinePass, você terá acesso a diversas academias e centros esportivos.</p>
        <p>Para aceitar o convite, clique no link abaixo:</p>
        <a href="${inviteUrl}">Aceitar Convite</a>
        <p>Este convite expira em 7 dias.</p>
        <p>Se você não esperava receber este convite, por favor ignore este email.</p>
      `,
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    await this.transporter.sendMail({
      from: `"TreinePass" <${this.configService.get('SMTP_FROM')}>`,
      to: email,
      subject: 'Bem-vindo ao TreinePass',
      html: `
        <h1>Olá ${name}!</h1>
        <p>Bem-vindo ao TreinePass, sua plataforma de acesso a academias e centros esportivos.</p>
        <p>Estamos felizes em tê-lo conosco!</p>
        <p>Comece agora mesmo a explorar as academias disponíveis em sua região.</p>
      `,
    });
  }
}
