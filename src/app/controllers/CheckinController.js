import { subDays } from 'date-fns';
import Checkin from '../schemas/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res) {
    // capiturando o id do studant pela chave primaria do banco
    const id = await Student.findByPk(req.params.studentId);
    // se o studant não existir cairá no if e sera exibido erro
    if (!id) {
      return res.status(404).json({ error: 'Student does not exists' });
    }
    // new Date() creates a new date object with the current date and time:
    // subDays Subtract the specified number of days from the given date.
    // subDays(new Date(), 7); subtrat 7 days from current date
    const hourOld = subDays(new Date(), 7);
    // countDocuments returns the count of documents that match the query
    const nCheckins = await Checkin.countDocuments({
      student_id: req.params.studentId,
      createdAt: {
        // $gt selects those documents where the value of the field is greater than the specified value
        // $gt: hourOld where value of the field greater than current date - 7 days
        $gt: hourOld,
        // $lt selects the documents where the value of the field is less than the specified value
        // lt: new Date() where value of the field less than current date
        $lt: new Date(),
      },
    });
    if (nCheckins > 6) {
      return res
        .status(400)
        .json({ error: "You've done 7 checkins this week" });
    }
    await Checkin.create({ student_id: req.params.studentId });
    return res.json(`You've done ${nCheckins + 1} checkins`);
  }

  async index(req, res) {
    const studentCheckins = await Checkin.find({
      student_id: req.params.studentId,
    });
    return res.json(studentCheckins);
  }
}

export default new CheckinController();
