const {Router} = require('express');
// Importar todos los routers hijos de este router padre.
const pokemonRouter = require('./pokemonRouter.js');
const typeRouter = require('./typeRouter.js');

const router = Router();

// Configurar los routers
router.use('/pokemons', pokemonRouter);
router.use('/types', typeRouter);

module.exports = router;
