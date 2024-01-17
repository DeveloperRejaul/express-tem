import Joi from 'joi';
import prisma from '../../../prisma';
import { userRole } from '../../constants/constants';

const { product: Product, rating: Rating } = prisma;
const { ADMIN, MODERATOR, SUPER_ADMIN } = userRole;

/**
 * @description this function used for creating rating
 * and update product rating
 * @returns
 */

const createRatingSchema = Joi.object().keys({
  productId: Joi.string().id().required(),
  rating: Joi.number().required().min(1).max(5),
  text: Joi.string().min(5).max(1000).required(),
});

export const creatingRating = () => async (req, res) => {
  try {
    // clean without  fields objects property
    const fields = Object.keys(createRatingSchema.describe().keys);
    Object.keys(req.body).forEach((k) => { if (!fields.includes(k)) delete req.body[k]; });

    // check valid input
    const { error } = createRatingSchema.validate(req.body);
    if (error) return res.status(400).send(`Invalid Request: ${error.details[0].message}`);

    // create rating
    const rating = await Rating.create({ data: { ...req.body, userId: req.id } });

    // find all rating with product id
    const ratings = await Rating.findMany({ where: { productId: req.body.productId } });

    // update product rating
    if (ratings.length <= 0) {
      const product = await Product.update({ where: { id: req.body.productId }, data: { rating: req.body.rating } });
      return res.status(200).send({ product, rating });
    }

    const totalRating = ratings.reduce((acc, cur) => cur.rating + acc, 0);
    const mainRating = totalRating / ratings.length;

    const product = await Product.update({ where: { id: req.body.productId }, data: { rating: mainRating } });
    res.status(200).send({ product, rating });
  } catch (err) {
    res.status(400).send('something wrong');
    console.log(err);
  }
};

/**
 * @description this function used for get all rating
 * @returns
 */
export const getAllRating = () => async (req, res) => {
  try {
    if (![ADMIN, MODERATOR, SUPER_ADMIN].includes(req.role)) return res.status(400).send('Invalid request ');
    const rating = await Rating.findMany({ include: { Product: true, User: true } });
    res.status(200).send(rating);
  } catch (error) {
    res.status(400).send('something wrong');
    console.log(error);
  }
};

/**
 * @description this function used for update  rating
 * @returns
 */

const updateRatingSchema = Joi.object().keys({
  productId: Joi.string().id(),
  rating: Joi.number().required().min(1).max(5),
  text: Joi.string().min(5).max(1000),
});

export const updateRating = () => async (req, res) => {
  try {
    // check user role valid access permissions
    if (![ADMIN, MODERATOR, SUPER_ADMIN].includes(req.role)) return res.status(400).send('Invalid request ');

    // clean without  fields objects property
    const fields = Object.keys(updateRatingSchema.describe().keys);
    Object.keys(req.body).forEach((k) => { if (!fields.includes(k)) delete req.body[k]; });

    // check valid input
    const { error } = updateRatingSchema.validate(req.body);
    if (error) return res.status(400).send(`Invalid Request: ${error.details[0].message}`);

    // update rating
    const rating = await Rating.update({ where: { id: req.params.id }, data: req.body });

    // find all rating with product id
    const ratings = await Rating.findMany({ where: { productId: req.params.id } });

    // calculate rating
    const totalRating = ratings.reduce((acc, cur) => cur.rating + acc, 0);
    const mainRating = totalRating / ratings.length;

    // update product rating
    const product = await Product.update({ where: { id: rating.productId }, data: { rating: mainRating } });
    res.status(200).send({ product, rating });
  } catch (error) {
    res.status(400).send('something wrong');
    console.log(error);
  }
};

export const deleteRating = () => async (req, res) => {
  try {
    if ([ADMIN, MODERATOR, SUPER_ADMIN].includes(req.role)) {
      const rating = await Rating.delete({ where: { id: req.params.id } });
      return res.status(200).send(rating);
    }

    const rating = await Rating.findUnique({ where: { id: req.params.id } });
    if (rating.userId !== req.id) return res.status(401).send('Invalid request');
    await Rating.delete({ where: { id: req.params.id } });
    res.status(200).send(rating);
  } catch (error) {
    res.status(400).send('something wrong');
    console.log(error);
  }
};