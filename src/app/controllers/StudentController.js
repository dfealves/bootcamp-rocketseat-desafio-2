// yup para validar os campos
import * as Yup from 'yup';
import Student from '../models/Student';

class StudentsController {
  async store(req, res) {
    // validações para os campos
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.string(),
      weight: Yup.string().required(),
      height: Yup.string().required(),
    });

    // se a validação não estiver valida
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }
    // pegando um unico estudante pelo email (unico)
    const studentsExists = await Student.findOne({
      where: { email: req.body.email },
    });

    // se o estudante ja existit cairá no if
    if (studentsExists) {
      return res.status(400).json({ error: 'Student already exists' });
    }
    // campos que serão passados no insomnia e enviados para o banco de dados
    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );

    return res.json({
      id,
      name,
      email,
      age,
      weight,
      height,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.string(),
      weight: Yup.string(),
      height: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }
    // capturando o id que será enviado como parametro
    const { id } = req.params;
    // capturando o email que esta no corpo da requisição
    const { email } = req.body;

    // capiturando o id do studant pela chave primaria do banco
    const student = await Student.findByPk(id);
    // se o studant não existir cairá no if e sera exibido erro
    if (!student) {
      return res.status(404).json({ error: 'Student does not exists' });
    }

    // verifica se o email do campo que foi enviado e se é diferente do email do aluno, caso contrário precisamos verificar se esse novo email já está em uso ou não
    if (email && student.email !== email) {
      const studentExists = await Student.findOne({
        where: { email },
      });

      if (studentExists) {
        return res.status(400).json({ error: 'Student already exists' });
      }
    }

    const { name, age, weight, height } = await student.update(req.body);

    return res.json({
      id,
      name,
      email,
      age,
      weight,
      height,
    });
  }
}

export default new StudentsController();
