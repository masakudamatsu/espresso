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


// POST request
menusRouter.post('/', (req, res, next) => {
  const newTitle = req.body.menu.title;
  // Check the validity of request
  if (!newTitle) {
    return res.sendStatus(400);
  }
  // Insert a new row to the database
  const sql = 'INSERT INTO Menu ' +
              '(title) ' +
              'VALUES ($title)';
  const values = {
    $title: newTitle
  };
  db.run(sql, values, function(err) { // Do not use the arrow function
      if (err) {
        next(err);
      }
      // Return the newly added row
      db.get(
        'SELECT * FROM Menu WHERE id = $id',
        { $id: this.lastID }, // This is why we cannot use the arrow function
        (err, row) => {
          if (err) {
            next(err);
          }
          res.status(201).json({menu: row});
        }
      );
    }
  );
});


// Check if the requested row exists
menusRouter.param('menuId', (req, res, next, id) => {
  db.get(
    'SELECT * FROM Menu WHERE id = $id',
    { $id: id },
    (err, row) => {
      if (err) {
        res.sendStatus(400);
      } else if (!row) {
        res.sendStatus(404);
      } else {
        req.menu = row; // To be used for GET request below
        next();
      }
    }
  );
});

// GET single row request
menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

module.exports = menusRouter;
