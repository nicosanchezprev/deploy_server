const { Router } = require('express');
const { Pokemon, Type } = require('../db.js');

const { 
  findPokemonsApi, 
  findPokemonsDb, 
  findPokemonName,
  findPokeDetail
} = require('../controllers/utils.js');

const pokemonRouter = Router();

pokemonRouter.get('/', async (req, res) => {
  const { name } = req.query;
  try {
    if(!name) { // SI NO TENGO NAME POR QUERY BUSCO TODOS LOS POKEMONS
      const apiPoke = await findPokemonsApi();
      const dbPoke = await findPokemonsDb(); 
      const allPoke = [...dbPoke , ...apiPoke]; 
      res.status(200).send(allPoke);
    } else {  // SI SI TENGO NAME POR QUERY BUSCO ESE POKEMON ESPECIFICO
      const namePoke = await findPokemonName(name);
      if(namePoke.name) {
        res.status(200).send(namePoke);
      } else {
        res.status(400).send("Pokemon no encontrado");
      }
    }
  } catch (error) {
    res.status(400).send("Pokemon no encontrado");
  };
});

pokemonRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const detail = await findPokeDetail(id);
    if(detail) {
      res.status(200).send(detail);
    } else {
      res.status(400).send("No existe un pokemon con esa id!");
    }
  } catch (error) {
    res.status(400).send(error.message);
  };
});


pokemonRouter.post('/', async (req, res) => {
  const { name , hp , attack , defense , speed , height , weight , img, createdInDb, types } = req.body;
  try {
    let imgDefault = "";
    
    if(img === "") {
      imgDefault = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Pokebola-pokeball-png-0.png/800px-Pokebola-pokeball-png-0.png";
    } else {
      imgDefault = img;
    };
    const newPokemon = await Pokemon.create({ 
      name , 
      hp , 
      attack , 
      defense , 
      speed , 
      height , 
      weight , 
      img: imgDefault, 
      createdInDb
    });
    await newPokemon.addType(types);
    res.status(200).send(newPokemon);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

pokemonRouter.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pokemonDelete = await Pokemon.findByPk(id);
    if(!pokemonDelete) {
      res.status(400).send("No existe el pokemon que desea eliminar");
    } else {
      await Pokemon.destroy({
        where: {
          id
        }
      });
      return res.status(200).send("Pokemon eliminado correctamente");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});


pokemonRouter.put('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      hp,
      attack,
      defense,
      speed,
      height,
      weight,
      img,
      types,
      createdInDb,
    } = req.body;

    const pokemonUpdated = await Pokemon.findByPk(id);
    
    let imgDefault = "";
    
    if(img === "") {
      imgDefault = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Pokebola-pokeball-png-0.png/800px-Pokebola-pokeball-png-0.png";
    } else {
      imgDefault = img;
    };

    if(id) {

      
      if(name) {
        await Pokemon.update({
          name,
          hp,
          attack,
          defense,
          speed,
          height: Number(height),
          weight: Number(weight),
          img: imgDefault,
          createdInDb
        },
        { where: { id }}
        );
        
        await pokemonUpdated.setTypes(types);
      
        res.status(200).send("Pokemon modificado con exito");
      } else {
        res.status(400).send("Faltaron datos para modificar el pokemon");
      };
    };
  } catch (error) {
    res.status(400).send(error.message);
  }
})


module.exports = pokemonRouter;