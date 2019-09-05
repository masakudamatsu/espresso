const timesheetsRouter = require('express').Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


// GET all requests
timesheetsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Timesheet ' +
              'WHERE employee_id = $employeeId';
  const values = {
    $employeeId: req.params.employeeId
  };
  db.all(sql, values, (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({timesheets: rows});
    }
  });
});

// POST request
timesheetsRouter.post('/', (req, res, next) => {
  const newHours = req.body.timesheet.hours;
  const newRate = req.body.timesheet.rate;
  const newDate = req.body.timesheet.date;
  const employeeId = req.params.employeeId;
  // Check the validity of request
  if (!newHours || !newRate || !newDate) {
    return res.sendStatus(400);
  }
  // Insert a new row to the database
  const sql = 'INSERT INTO Timesheet ' +
              '(hours, rate, date, employee_id) ' +
              'VALUES ($hours, $rate, $date, $employeeId)';
  const values = {
    $hours: newHours,
    $rate: newRate,
    $date: newDate,
    $employeeId: employeeId
  };
  db.run(sql, values, function(err) { // Do not use the arrow function
      if (err) {
        next(err);
      }
      // Return the newly added row
      db.get(
        'SELECT * FROM Timesheet WHERE id = $id',
        { $id: this.lastID }, // This is why we cannot use the arrow function
        (err, row) => {
          if (err) {
            next(err);
          }
          res.status(201).json({timesheet: row});
        }
      );
    }
  );
});

timesheetsRouter.param('timesheetId', (req, res, next, id) => {
  db.get(
    'SELECT * FROM Timesheet WHERE id = $timesheetId',
    { $timesheetId: id},
    (err, timesheet) => {
      if (err) {
        res.sendStatus(400);
      } else if (!timesheet) {
        res.sendStatus(404);
      } else {
        req.timesheet = timesheet;
        next();
      }
    }
  );
});

timesheetsRouter.use('/:timesheetId', (req, res, next) => {
  db.get(
    'SELECT * FROM Employee WHERE id = $employeeId',
    { $employeeId: req.params.employeeId},
    (err, employee) => {
      if (err) {
        res.sendStatus(400);
      } else if (!employee) {
        res.sendStatus(404);
      } else {
        req.employee = employee;
        next();
      }
    }
  );

});

// PUT request
timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const newHours = req.body.timesheet.hours;
  const newRate = req.body.timesheet.rate;
  const newDate = req.body.timesheet.date;
  const employeeId = req.params.employeeId;
  const timesheetId = req.params.timesheetId;
  // Check the validity of request
  if (!newHours || !newRate || !newDate) {
    return res.sendStatus(400);
  }
  const sql = 'UPDATE Timesheet ' +
              'SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId ' +
              'WHERE id = $id';
  const values = {
    $hours: newHours,
    $rate: newRate,
    $date: newDate,
    $employeeId: employeeId,
    $id: timesheetId
  };
  db.run(sql, values, function(err) {
    if (err) {
      next(err);
    } else {
    // Return the updated row
      db.get(
        'SELECT * FROM Timesheet WHERE id = $id',
        { $id: timesheetId },
        (err, row) => {
          if (err) next(err);
          res.status(200).json({timesheet: row});
        }
      );
    }
  });
});

module.exports = timesheetsRouter;
