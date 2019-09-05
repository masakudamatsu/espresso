const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

const employeesRouter = require('./api/employees');
app.use('/api/employees', employeesRouter);

const menusRouter = require('./api/menus');
app.use('/api/menus', menusRouter);

app.use(errorHandler());

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
