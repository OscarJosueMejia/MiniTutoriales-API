import nodemailer from 'nodemailer';
import path from 'path';
import hbs from 'nodemailer-express-handlebars';

export const emailSender = async (data) => {
  const configurationEmail = {
    from: 'Mini Tutoriales Web',
    to: data.email,
    subject: data.subject,
    template: data.templateName,
    context: data.context,
  };

  const transport = nodemailer.createTransport({
    host: process.env.MAIL_SERVICE,
    port: Number(process.env.MAIL_PORT),
    auth: {
      user: process.env.MAIL_ACCOUNT,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  // Configuración de handlebars
  const hbsConfig = {
    viewEngine: {
      extName: '.hbs',
      partialsDir: path.join(__dirname, './htmlTemplates/'),
      layoutsDir: path.join(__dirname, './htmlTemplates/'),
      defaultLayout: '',
    },
    viewPath: path.join(__dirname, './htmlTemplates/'),
    extName: '.hbs',
  };

  transport.use('compile', hbs(hbsConfig));

  await transport.verify(async function (error) {
    if (error) {
      console.error(error);
    }
  });

  return await transport.sendMail(configurationEmail);
};
