const userRouter = require('./user/user');
const catagoryRouter = require('./catagory/catagory');
const productRouter = require('./products/product');
const couponRouter = require('./coupon/coupon');

// need add all routes add socket serveries  
module.exports = [
	userRouter,
	catagoryRouter,
	productRouter,
	couponRouter
];

