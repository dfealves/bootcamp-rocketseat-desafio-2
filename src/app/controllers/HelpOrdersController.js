import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Registration from '../models/Registration';

class HelpOrdersController {
  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({
        error: 'Student does not exists',
      });
    }

    const registration = await Registration.findOne({
      where: { student_id: studentId },
    });

    if (!registration) {
      return res
        .status(400)
        .json({ error: 'Student does not have an register' });
    }

    const { question } = req.body;

    const { id } = await HelpOrder.create({
      student_id: studentId,
      question,
    });

    return res.json(
      await HelpOrder.findByPk(id, {
        attributes: ['id', 'question'],
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'name', 'email', 'age', 'height', 'weight'],
          },
        ],
      })
    );
  }

  async index(req, res) {
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist' });
    }

    const registration = await Registration.findOne({
      where: { student_id: studentId },
    });

    if (!registration) {
      return res
        .status(400)
        .json({ error: 'Student does not have an register' });
    }

    const helpOrders = await HelpOrder.findAll({
      where: { student_id: studentId },
      attributes: ['id', 'question', 'answer', 'answer_at'],
    });

    return res.json(helpOrders);
  }
}

export default new HelpOrdersController();
