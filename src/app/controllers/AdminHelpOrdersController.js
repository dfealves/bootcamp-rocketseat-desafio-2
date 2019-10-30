import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import StoreAdminHelpOrder from '../jobs/StoreAdminHelpOrder';
import Queue from '../../lib/Queue';

class AdminHelpOrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { helpOrdersId } = req.params;

    const helpOrder = await HelpOrder.findByPk(helpOrdersId, {
      include: [
        { model: Student, as: 'student', attributes: ['name', 'email'] },
      ],
    });

    if (!helpOrder) {
      return res.status(400).json({ error: 'Help-Order does not exist' });
    }

    const { answer } = req.body;

    helpOrder.answer = answer;
    helpOrder.answer_at = new Date();

    helpOrder.save();

    // Enviar email para o estudante

    await Queue.add(StoreAdminHelpOrder.key, {
      student: helpOrder.student,
      question: helpOrder.question,
      answer,
    });

    return res.json({
      student: helpOrder.student,
      question: helpOrder.question,
      answer,
    });
  }

  async index(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: { answer: null },
      attributes: ['id', 'question'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'height'],
        },
      ],
    });

    return res.json(helpOrders);
  }
}

export default new AdminHelpOrderController();
