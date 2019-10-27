import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  // validating the fields
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const planExists = await Plan.findOne({
      where: {
        title: req.body.title,
      },
    });

    if (planExists) {
      return res.status(400).json({ error: 'Plan already exists' });
    }

    // creating a new plan
    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  // updating a plan
  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number().integer(),
      price: Yup.number(),
    });

    if (!(await schema.isValid)) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title } = req.body;

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists' });
    }

    if (title !== plan.title) {
      const planExists = await Plan.findOne({
        where: { title },
      });

      if (planExists) {
        return res.status(400).json({ error: 'Plan title already exists' });
      }
    }

    const { duration, price } = await plan.update(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  // listing all plans
  async index(req, res) {
    const plans = await Plan.findAll(req.body.title);

    return res.json(plans);
  }

  // delete a plan by id
  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists' });
    }

    try {
      await plan.destroy();
      return res.status(200).json({ message: 'Plan deleted successfully' });
    } catch (error) {
      return res.status(400).json({ error: 'Delete failed' });
    }
  }

  // async delete(req, res) {
  //   const plan = await Plan.findByPk(req.params.id);

  //   if (!plan) {
  //     return res.status(400).json({ error: 'Plan does not exists' });
  //   }
  //   await plan.destroy();
  //   res.status(200).json('Plan deleted');
  // }
}

export default new PlanController();
