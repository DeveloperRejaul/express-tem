const Joi = require('joi');
const { catagory:Catagory } = require('../../../prisma/index');
const { userRole } = require('../../constants/constants');
const {ADMIN,MODERATOR,SUPER_ADMIN} = userRole;
const sportedUser = [ADMIN,MODERATOR,SUPER_ADMIN];
/**
 * @description creating product category  
 * @param {} req 
 * @param {*} res 
 */

const createCatagorySchema = Joi.object().keys({
	name: Joi.string().min(5).max(30).required(),
	child: Joi.array().items(Joi.string().required()),
});

module.exports.createCatagory = ()=> async (req, res) => {
	try {

		// clean without  fields objects property
		const fields = Object.keys(createCatagorySchema.describe().keys);
		Object.keys(req.body).forEach(k => { if (!fields.includes(k)) delete req.body[k]; });

		// check all filed data type
		const { error } = createCatagorySchema.validate(req.body);
		if (error) return res.status(202).send('Invalid request');

		// check role 
		if (sportedUser.includes( req.role)){
			const catagory = await Catagory.create({ data: { ...req.body, userId: req.id } });
			return res.status(200).send(catagory);
		} 
		res.status(200).send('Valid user required');
		
	} catch (err) {
		console.log('🚀 ~ file: category.fn.js:14 ~ module.exports.createCategory= ~ err:', err);
		res.status(404).send('Soothing wrong');
	}

};


/**
 * @description get product category  
 * @param {} req 
 * @param {*} res 
 */
module.exports.getCatagory = ()=> async (req, res) => {
	try {
		const catagory = await Catagory.findMany({ include: { User: { select: { email: true, name: true } } } });
		res.status(200).send(catagory);
	} catch (err) {
		res.status(404).send('Soothing wrong');
		console.log('🚀 ~ file: category.fn.js:32 ~ module.exports.getCategory= ~ err:', err);
	}
};



/**
 * @description update product category  
 * @param {} req 
 * @param {*} res 
 */
const updateCatagorySchema = Joi.object().keys({
	name: Joi.string().min(5).max(30),
	child: Joi.array(),
});

module.exports.updateCatagory = ()=> async (req, res) => {
	try {
		// clean without  fields objects property
		const fields = Object.keys(updateCatagorySchema.describe().keys);
		Object.keys(req.body).forEach(k => { if (!fields.includes(k)) delete req.body[k]; });

		// check all filed data type
		const { error } = updateCatagorySchema.validate(req.body);
		if (error) return res.status(202).send('Invalid request');

		// check Catagory exists
		const existsCatagory = await Catagory.findUnique({ where: { id: req.params.id }});
		if(!existsCatagory) return res.status(401).send('Catagory not found');
		

		//check user role
		if(sportedUser.includes(req.role)){
			const catagory = await Catagory.update({ where: { id: req.params.id, }, data: req.body });
			return res.status(200).send(catagory);
		}
		res.status(200).send('Valid user required');
	} catch (err) {
		console.log('🚀 ~ file: category.fn.js:51 ~ module.exports.updateCategory= ~ err:', err);
		res.status(404).send('Soothing wrong');
	}

};



/**
 * @description delete product category  
 * @param {} req 
 * @param {*} res 
 */
module.exports.deleteCatagory = ()=> async (req, res) => {
	try {

		// check params exists 
		if(!req.params?.id) return res.status(200).send('Valid request required');

		// check Catagory exists
		const existsCatagory = await Catagory.findUnique({ where: { id: req.params.id }});
		if(!existsCatagory) return res.status(401).send('Catagory not found');
				

		//check user role
		if(sportedUser.includes( req.role)){
			const catagory = await Catagory.delete({ where: { id: req.params.id } });
			return	res.status(200).send(catagory);
		}
		res.status(200).send('Valid user required');

	} catch (err) {
		console.log('🚀 ~ file: category.fn.js:70 ~ module.exports.deleteCategory ~ err:', err);
		res.status(404).send('Soothing wrong');
	}
};


