const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

const multer = require('multer');
const fs = require('fs');

require("dotenv").config();

require('./cron-job');

const sequelize = require('./util/database');

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const memberRoutes = require('./routes/member');
const socketIo = require('./routes/socket')
 
//Model Import
const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require('./models/group');
const Connector = require('./models/connector');

const app = express();
const server = http.createServer(app);
const io = socketIo.init(server);

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');  
    next();
})

app.use(express.json());
/* app.use(cors({
    origin: '*',        //means takes request from all IP's we can also just give a simple live server IP: http://127.0.0.1:'PORT' 
    //method: ['GET', 'DELETE']     //This means that only GEt and Delete methods are allowed from this IP, we can also add different methods combinations
})); */
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', userRoutes);
app.use('/chatApp', chatRoutes);  //need further look!!!!!!!!!!!!!!!!!
app.use('/grpFind', memberRoutes);


app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'view', '404.html'));
})

//Database Relations
User.hasMany(Connector, {foreignKey: "user_id"});
Connector.belongsTo(User, {constraints: true, onDelete: "CASCADE", foreignKey: "user_id"});

Group.hasMany(Connector, {foreignKey: "group_id"});
Connector.belongsTo(Group, {constraints: true, onDelete: "CASCADE", foreignKey: "group_id"});

Group.hasMany(Chat, {foreignKey: "group_id"});
Chat.belongsTo(Group, {constraints: true, onDelete: "CASCADE", foreignKey: "group_id"})


const PORT=`${process.env.PORT}`;

//sequelize.sync({alter:true})
sequelize.sync()
.then(result => {
    server.listen(PORT, () => {
        console.log(`Server is running at port ${PORT}`);
    });
})
.catch(err => console.log('Database Connection Error : ', err));

