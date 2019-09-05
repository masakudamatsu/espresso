const menusRouter = require('express').Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


// GET all requests
menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({menus: rows});
    }
  });
});

module.exports = menusRouter;
