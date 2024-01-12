const { Router } = require('express');
const { auth } = require('../../middleware/auth');
const router = Router();
const {
	createUser, getUsers, updateUser, deleteUser, getUser, 
	loginUser, logoutUser, forgotPassword,
	newPassword, codeVerification,
	checkAuthUser
} = require('./user.fn');
const { upload } = require('../../middleware/fileUp');


module.exports = (params) => {

	router.post('/user/login', loginUser(params));
	router.post('/user/logout', logoutUser(params));
	router.post('/user/check', checkAuthUser(params));
	router.post('/user/signup',auth, upload.single('avatar'), createUser(params));

	router.post('/user/forgot-password', forgotPassword(params));
	router.post('/user/code-check', codeVerification(params));
	router.post('/user/new-password', newPassword(params));

	// all user routes 
	router.get('/auth/user', auth, getUsers(params));
	router.get('/auth/user/:id', auth, getUser(params));
	router.put('/auth/user/:id', auth,upload.single('avatar'), updateUser(params));
	router.delete('/auth/user/:id', auth, deleteUser(params));


	return router;
};
