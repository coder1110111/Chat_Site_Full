const express = require('express');
const cors = require('cors');
const path = require('path');

require("dotenv").config();

const sequelize = require('./util/database');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');

//Model Import
const User = require('./models/user');
const Chat = require('./models/chat');

const app = express();

app.use(express.json());
/* app.use(cors({
    origin: '*',        //means takes request from all IP's we can also just give a simple live server IP: http://127.0.0.1:'PORT' 
    //method: ['GET', 'DELETE']     //This means that only GEt and Delete methods are allowed from this IP, we can also add different methods combinations
})); */
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', userRoutes);
app.use('/chatApp', chatRoutes);


app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'view', '404.html'));
})

//Database Relations
User.hasMany(Chat, {foreignKey: "userId"});
Chat.belongsTo(User, {constraints: true, onDelete: "CASCADE", foreignKey: "userId"})


const PORT=`${process.env.PORT}`;

//sequelize.sync({force:true})
sequelize.sync()
.then(result => {
    app.listen(PORT);
})
.catch(err => console.log(err));

