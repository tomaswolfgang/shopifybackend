require('dotenv').load();

var mongoose = require('mongoose');

mongoose.connect(process.env.DB_LINK);
