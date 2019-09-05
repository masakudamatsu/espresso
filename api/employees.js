const employeesRouter = require('express').Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// GET all requests
employeesRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Employee ' +
              'WHERE is_current_employee = $status';
  const values = {
    $status: 1
  };
  db.all(sql, values, (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({employees: rows});
    }
  });
});

// POST request
employeesRouter.post('/', (req, res, next) => {
  const newName = req.body.employee.name;
  const newPosition = req.body.employee.position;
  const newWage = req.body.employee.wage;
  // Check the validity of request
  if (!newName || !newPosition || !newWage) {
    return res.sendStatus(400);
  }
  // Insert a new row to the database
  const sql = 'INSERT INTO Employee ' +
              '(name, position, wage) ' +
              'VALUES ($name, $position, $wage)';
  const values = {
    $name: newName,
    $position: newPosition,
    $wage: newWage
  };
  db.run(sql, values, function(err) { // Do not use the arrow function
      if (err) {
        next(err);
      }
      // Return the newly added row
      db.get(
        'SELECT * FROM Employee WHERE id = $id',
        { $id: this.lastID }, // This is why we cannot use the arrow function
        (err, row) => {
          if (err) {
            next(err);
          }
          res.status(201).json({employee: row});
        }
      );
    }
  );
});

module.exports = employeesRouter;
