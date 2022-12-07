const axios = require('axios');
const { Pokemon, Type } = require('../db.js');

const findTypes = async () => {
  try {
    const api = await axios.get('https://pokeapi.co/api/v2/type', {
      headers: {
        "accept-encoding": "*",
      },
    });

    for(t of api.data.results) {
      const existe = await Type.findOne({ where: {name: t.name }});
      if (existe) {
        var data = await Type.findAll();
        return data;
      } else {
        await Type.create({ name: t.name });
      }
    };
  } catch (error) {
    return error.message;
  }
};

const findPokemonsApi = async () => {
  try {
    const api_1ra = await axios.get('https://pokeapi.co/api/v2/pokemon', {
      headers: {
        "accept-encoding": "*",
      },
    });
    const poke_mitad1 = api_1ra.data.results;
  
    const api_2da = await axios.get(api_1ra.data.next);
    const poke_mitad2 = api_2da.data.results;

    const allPoke = [...poke_mitad1, ...poke_mitad2];

    const arrInfo = [];
    for(p of allPoke) {
      // imagen
      const api = await axios.get(p.url);
      const img = api.data.sprites.other["official-artwork"].front_default;
      // nombre 
      const name = api.data.name;
      // ataque (Para el filtrado)
      const attack = api.data.stats[1].base_stat;
      //id
      const id = api.data.id;
      // tipos
      const tiposArr = api.data.types;
      const types = tiposArr.map(e => e.type.name);
      arrInfo.push({id, name, img, attack, types});
    }
    return arrInfo;
  } catch (error) {
    return error.message;
  }
};

const findPokemonsDb = async () => {
  try {
    const pokes = (await Pokemon.findAll({
      attributes: ["id", "name", "img", "createdInDb", "attack"],
      include: [
        {
          model: Type,
          attributes: ["name"],
          through: { attributes: [] }
        }
      ]
    })).map(poke => {
      const json = poke.toJSON();
      return{
        ...json,
        types: json.types.map( type => type.name )
      }
    });
    return pokes;
  } catch (error) {
    return error.message;
  }
  
};


const findPokemonName = async (name) => {
  try {
    const pokeName = (await Pokemon.findAll({
      where: { name },
      attributes: ["id", "name", "img"],
      include: [
        {
          model: Type,
          attributes: ["name"],
          through: { attributes: [] }
        }
      ]
    })).map(poke => {
      const json = poke.toJSON();
      return{
        ...json,
        types: json.types.map( type => type.name )
      }
    });
    
    if (!pokeName[0]) {
      const api = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${name}`, {
          headers: {
            "accept-encoding": "*",
          },
        }
      ).then(response => response.data);
      
      const idPokemon = api.id;
      const namePokemon = api.name;
      const imgPokemon = api.sprites.other["official-artwork"].front_default;
      const tiposArr = api.types;
      const typesPokemon = tiposArr.map(e => e.type.name);
      
      let infoPoke;
      infoPoke = {
        id: idPokemon,
        name: namePokemon, 
        img: imgPokemon, 
        types: typesPokemon
      };
      return infoPoke;
    };
    return pokeName[0]; 
  } catch (error) {
    return (error.message + "pokemon no encontrado desde utils");
  }
};



const findPokeDetail = async (id) => {
  try {
    // BUSCO EN LA DB
    if(id.includes('-')) {
      const pokemonDb = (await Pokemon.findAll({
        where: { id },
        include: [
          {
            model: Type,
            attributes: ["name"],
            through: { attributes: [] }
          }
        ]
      })).map(poke => {
        const json = poke.toJSON();
        return{
          ...json,
          types: json.types.map( type => type.name )
        }
      });
      return pokemonDb[0];
    } else {
      // BUSCO EN LA API
      const api = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${id}`, {
          headers: {
            "accept-encoding": "*",
          },
        }
      ).then(response => response.data);
    
      const namePokemon = api.name;
      const hpPokemon = api.stats[0].base_stat;
      const attackPokemon = api.stats[1].base_stat;
      const defensePokemon = api.stats[2].base_stat;
      const speedPokemon = api.stats[5].base_stat;
      const heightPokemon = api.height;
      const weightPokemon = api.weight;
      const tiposArr = api.types;
      const typesPokemon = tiposArr.map(e => e.type.name);  
      const imgPokemon = api.sprites.other["official-artwork"].front_default;

      const apiPokemon = {
        id,
        name: namePokemon, 
        hp: hpPokemon,
        attack: attackPokemon,
        defense: defensePokemon,
        speed: speedPokemon,
        height: heightPokemon,
        weight: weightPokemon,
        img: imgPokemon,
        types: typesPokemon
      };
      return apiPokemon;
    }
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  findTypes,
  findPokemonsApi,
  findPokemonsDb,
  findPokemonName,
  findPokeDetail
}