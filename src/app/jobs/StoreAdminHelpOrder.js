import Mail from '../../lib/Mail';

class StoreAdminHelpOrder {
  get key() {
    return 'StoreAdminHelpOrder';
  }

  async handle({ data }) {
    const { student, question, answer } = data;

    console.log('A FILA EXECUTOU');
    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'question answered by GymPoint',
      template: 'storeAdminHelpOrder',
      context: {
        student: student.name,
        question,
        answer,
      },
    });
  }
}

export default new StoreAdminHelpOrder();
