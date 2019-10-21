/* eslint-disable no-console */
import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      senha: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    console.log(req.userId);
    return res.status(200).json({ ok: true });
  }
}

/* const schema = Yup.object().shape({
  name: Yup.string(),
  email: Yup.string(),
  oldPassword: Yup.string()
    .min(6),
  password: Yup.string()
  .min(6)
  .when('oldPassword', (oldPassword, field) =>
    oldPassword ? field.required(): field
  ),
  confirmPassword: Yup.string().when('password', (password, field) =>
    password ? field.required().oneOf([Yup.ref('password')]) : field
  )
});


if (!(await schema.isValid(req.body))) {
  return res.status(400).json({ error: 'Validation fails' });
}
*/

export default new UserController();
