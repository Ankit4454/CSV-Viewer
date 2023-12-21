const express = require('express');
const app = express();
const port = 8000;
const db = require('./config/mongoose');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname,'assets')));

app.use(expressLayouts);
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, './views'));

app.use('/', require('./routes'));

app.listen(port, function(err){
    if(err){
        console.log(`Error in running server ${err}`);
    }
    console.log(`Server is up and running on port: ${port}`);
});