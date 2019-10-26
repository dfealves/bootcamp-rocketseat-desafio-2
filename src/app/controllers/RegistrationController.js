import * as Yup from 'yup';
import { parseISO, endOfDay, addMonths } from 'date-fns';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Plan from '../models/Plan';

class RegistrationController {
  async store(req, res) {
    // validação para os campos
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
    const RegPrice = isPlan.price * isPlan.duration;

    // getting a single registration

    const registration = await Registration.create({
      ...req.body,
      student_id,
      plan_id,
      start_date: startDate,
      end_date,
      price: RegPrice,
    });
    return res.json(registration);
  }
}

export default new RegistrationController();
