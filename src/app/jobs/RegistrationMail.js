import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { name, email, title, price, end_date } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: `Welcome ${name} to GymPoint!!!`,
      template: 'registration',
      context: {
        student: name,
        plan: title,
        price: price.toFixed(2),
        end_date: format(
          parseISO(end_date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new RegistrationMail();
