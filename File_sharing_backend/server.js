require('dotenv').config();

const express = require('express');

const path =require('path');

const app = express();

const PORT = "5500";

const cors = require('cors');

app.use(express.static('public'));
app.use(express.json());

const connectDB = require('./config/db');
connectDB();

//Cors
const corsOptions = {
    origin: "http://127.0.0.1:5500",

}
app.use(cors(corsOptions));

//Template Engine
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');


//Routes
app.use('/api/files', require('./routes/files'));
app.use('/files',require('./routes/show'));
app.use('/files/download',require('./routes/download'));

app.listen(PORT, () =>{
    console.log(`Listening on Port ${PORT}`);
});