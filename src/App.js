require('dotenv').config();
const {json,urlencoded,} = require('express');
const port = process.env.PORT || 4000;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const settings = require('./setting.js');
const routes = require('./futures/index.js');
require('./config/passportAuth.js');
const http = require('http');
const { socketStart } = require('./config/socket.js');


module.exports = function App (){

	const app = express();
	const server = http.createServer(app);
	const io = socketStart(server);
    
	io.on('connection', (socket)=>{
		console.log(`user connected: ${socket.id}`);
		socket.on('disconnect', () => {
			console.log(`user disconnect: ${socket.id}`);
		});
	});
    
	app.use(json());
	app.use(urlencoded({extended:true}));
	app.use(cookieParser());
	app.use(session({ secret:process.env.SESSION_SECRET,resave: false, saveUninitialized: true,  cookie: { secure: false }}));
	app.use(passport.initialize());
	app.use(passport.session());
    
	const corsOptions ={ origin:settings.origin, credentials:true,  optionSuccessStatus:200 };
	app.use(cors(corsOptions));
	routes.forEach(fn=> app.use('/api/v-1', fn(io)));
	app.get('/', (_req, res) => res.send({ message: 'server is ok' }));
	// app.use((req, res, next) => res.send({ message: "bad url" }));
	// app.use((err, req, res, next) => res.send({ message: "other error" }));
	server.listen(port, () => console.log(`app listening on port ${port}!`));
};