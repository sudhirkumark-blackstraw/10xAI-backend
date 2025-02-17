// src/mail/mail.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class MailService {
  private transactionalEmailsApi: SibApiV3Sdk.TransactionalEmailsApi;

  constructor() {
    // Initialize the SendinBlue API client.
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.SIB_API_KEY;
    this.transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  /**
   * Loads an email template from the file system and compiles it with Handlebars.
   * Assumes that your templates are stored in "src/mail/templates/emails".
   *
   * @param templateName The name of the template file (without extension)
   * @param variables An object containing the variables to inject into the template
   * @returns The compiled HTML string
   */
  loadTemplate(templateName: string, variables: Record<string, any>): string {
    try {
      const templatePath = path.join(__dirname, 'templates', 'emails', `${templateName}.html`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      return template(variables);
    } catch (error) {
      throw new InternalServerErrorException('Could not load email template');
    }
  }

  /**
   * Sends an email using Brevo (SendinBlue) transactional email API.
   *
   * @param to Recipient email address.
   * @param subject Subject of the email.
   * @param html HTML content of the email.
   */
  async sendMail(to: string, subject: string, html: string) {
    const senderEmail = process.env.SIB_FROM_EMAIL;
    const senderName = process.env.SIB_FROM_NAME || 'Your App';
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = { email: senderEmail, name: senderName };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    
    try {
      const data = await this.transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
      return data;
    } catch (error) {
      throw new InternalServerErrorException('Error sending email: ' + error.message);
    }
  }
}
