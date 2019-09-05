const menuItemsRouter = require('express').Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


// GET all requests
menuItemsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM MenuItem ' +
              'WHERE menu_id = $menuId';
  const values = {
    $menuId: req.params.menuId
  };
  db.all(sql, values, (err, rows) => {
    if (err) {
      next(err);
    } else if (!rows) {
      res.sendStatus(404);
    } else {
      res.status(200).json({menuItems: rows});
    }
  });
});

// POST request
menuItemsRouter.post('/', (req, res, next) => {
  const newName = req.body.menuItem.name;
  const newDescription = req.body.menuItem.description;
  const newInventory = req.body.menuItem.inventory;
  const newPrice = req.body.menuItem.price;
  const menuId = req.params.menuId;
  // Check the validity of request
  if (!newName || !newInventory || !newPrice) {
    return res.sendStatus(400);
  }
  // Insert a new row to the database
  const sql = 'INSERT INTO MenuItem ' +
              '(name, description, inventory, price, menu_id) ' +
              'VALUES ($name, $description, $inventory, $price, $menuId)';
  const values = {
    $name: newName,
    $description: newDescription,
    $inventory: newInventory,
    $price: newPrice,
    $menuId: menuId
  };
  db.run(sql, values, function(err) { // Do not use the arrow function
      if (err) {
        next(err);
      }
      // Return the newly added row
      db.get(
        'SELECT * FROM MenuItem WHERE id = $id',
        { $id: this.lastID }, // This is why we cannot use the arrow function
        (err, row) => {
          if (err) {
            next(err);
          }
          res.status(201).json({menuItem: row});
        }
      );
    }
  );
});

menuItemsRouter.param('menuItemId', (req, res, next, id) => {
  db.get(
    'SELECT * FROM MenuItem WHERE id = $menuItemId',
    { $menuItemId: id},
    (err, menuItem) => {
      if (err) {
        res.sendStatus(400);
      } else if (!menuItem) {
        res.sendStatus(404);
      } else {
        req.menuItem = menuItem;
        next();
      }
    }
  );
});

// PUT request
menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const newName = req.body.menuItem.name;
  const newDescription = req.body.menuItem.description;
  const newInventory = req.body.menuItem.inventory;
  const newPrice = req.body.menuItem.price;
  const menuId = req.params.menuId;
  const menuItemId = req.params.menuItemId;
  // Check the validity of request
  if (!newName || !newInventory || !newPrice) {
    return res.sendStatus(400);
  }
  const sql = 'UPDATE MenuItem ' +
              'SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId ' +
              'WHERE id = $id';
  const values = {
    $name: newName,
    $description: newDescription,
    $inventory: newInventory,
    $price: newPrice,
    $menuId: menuId,
    $id: menuItemId
  };
  db.run(sql, values, function(err) {
    if (err) {
      next(err);
    } else {
    // Return the updated row
      db.get(
        'SELECT * FROM MenuItem WHERE id = $id',
        { $id: menuItemId },
        (err, row) => {
          if (err) next(err);
          res.status(200).json({menuItem: row});
        }
      );
    }
  });
});

module.exports = menuItemsRouter;
