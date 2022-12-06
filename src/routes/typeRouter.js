const { Router } = require('express');
const { Type } = require('../db.js');

const { findTypes } = require('../controllers/utils.js');

const typeRouter = Router();

typeRouter.get('/', async (req, res) => {
  try {
    await findTypes();
    res.status(200).send(await Type.findAll());
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = typeRouter;