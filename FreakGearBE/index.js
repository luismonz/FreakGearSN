const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');
const routerApi = require('./routes');
const {config} = require('./config/config');
const { logErrors, errorHandler, boomErrorHandler } = require('./middlewares/error.handler')
const fs = require('fs');
const imagesDir = './uploads/users';

function createImageDirectory() { 
    if(!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }
}

createImageDirectory();

const port = config.port || 3000;

const getConnection = async () => {
    try {
        const conn = await mongoose.connect(config.dbUrl);
        console.log(`MongoDB Connected: ${conn.connection.host}. CONNECTION TO DB ${config.dbUrl} IS SUCCESSFUL`)
    }
    catch(error) {
        console.error(`ERROR: ${error.message}`)
    }
};

const app = express();

app.use(express.json());

const whitelist = ['http://127.0.0.1:5500', 'https://myapp.co'];
const options = {
  origin: (origin, callback) => {
    if(whitelist.includes(origin) || !origin) callback(null, true);
    else callback(new Error('NOT ALLOWED'))
  }
}

app.use(cors(options));

app.get('/', (req, res) => {
    res.send('SERVER ON! KEEP WORKING!');
});

routerApi(app);

app.use(logErrors);
app.use(boomErrorHandler);
app.use(errorHandler);


app.listen(port, async () => {
    await getConnection();
    console.log(`RUNNING ON PORT ${port}`);
});  