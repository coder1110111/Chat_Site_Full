const express = require('express');
const cors = require('cors');
const path = require('path');

require("dotenv").config();

const sequelize = require('./util/database');
const userRoutes = require('./routes/user');

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', userRoutes);
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'view', '404.html'));
})

const PORT=`${process.env.PORT}`;

sequelize.sync()
.then(result => {
    app.listen(PORT);
})
.catch(err => console.log(err));

