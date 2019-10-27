import * as Yup from 'yup';
import { parseISO, endOfDay, format, addMonths } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Plan from '../models/Plan';

import Mail from '../../lib/Mail';

class RegistrationController {
  async store(req, res) {
    // validation for fields
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
    });

    // if validation is no valid
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }
    // check if the plan exists
    const { student_id, plan_id, start_date } = req.body;

    const studentExists = await Student.findByPk(student_id);
    if (!studentExists) {
      return res.status(401).json({ message: 'Student does not exists' });
    }

    const isPlan = await Plan.findByPk(plan_id);

    if (!isPlan) {
      return res.status(401).json({ message: 'Plan not found' });
    }

    const startDate = endOfDay(parseISO(start_date));
    const end_date = addMonths(startDate, isPlan.duration);
    const regPrice = isPlan.price * isPlan.duration;

    const { studentId } = req.params;
    const registration = await Registration.findByPk(studentId, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'price', 'duration'],
        },
      ],
    });

    // getting a single registration
    const { name, email } = await Student.findOne({
      where: { id: req.body.student_id },
    });
    const { title, price } = await Plan.findOne({
      where: { id: req.body.plan_id },
    });
    const registry = await Registration.create({
      student_id,
      plan_id,
      start_date: startDate,
      end_date,
      price: regPrice,
    });

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: `Welcome ${name} to GymPoint!!!`,
      template: 'registration',
      context: {
        student: name,
        plan: title,
        price: price.toFixed(2),
        end_date: format(end_date, "'dia' dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });

    return res.json(registry);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number(),
      plan_id: Yup.number(),
    });

    if (!(await schema.isValid)) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(400).json({ error: 'Registration does not exists' });
    }

    const { student_id, plan_id, start_date } = await Registration.update(
      req.body
    );

    return res.json({
      student_id,
      plan_id,
      start_date,
    });
  }

  async index(req, res) {
    const registration = await Registration.findAll({
      where: {
        cancelled_at: null,
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title'],
        },
      ],
    });

    if (!registration) {
      return res.status(401).json({ message: 'Registry not found' });
    }

    return res.json(registration);
  }
}

export default new RegistrationController();
