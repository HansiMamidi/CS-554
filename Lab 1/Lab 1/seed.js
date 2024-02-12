import recipes from './data/recipes.js';
import users from './data/users.js';
import {dbConnection, closeConnection} from './config/mongoConnection.js';

//drops the database each time this is run
const db = await dbConnection();
// await db.dropDatabase();
async function main() {

  // try {
  //     const createBand = await recipes.create("PinkF", ["Progressive Rock", "Psychedelic rock", "Classic Rock","Testing"], "novice",["Progressive Rock", "Psychedelic rock", "Classic Rock","Testing","Steps"]);
  //     console.log(createBand);
  //   } catch (e) {
  //     console.log(e);
  //   }

    try {
      const createBand = await users.createUser("PinkF", "usernameT","User@123");
      console.log(createBand);
    } catch (e) {
      console.log(e);
    }

    // try {
    //   const createBand = await recipes.getAll();
    //   console.log(createBand);
    // } catch (e) {
    //   console.log(e);
    // }

    // try {
    //   const createBand = await bands.create("BTS", ["Rap", "Solo", "Love", "Motivational", "Self love", "Love"], "http://www.bts777.com", "Bighit", ["RM", "Jin", "Jimin", "JHope", "V", "Suga", "Jungkook",], 2012);
    //   console.log(createBand);
    // } catch (e) {
    //   console.log(e);
    // }

    // try {
    //   const createBand = await bands.create("Black Pink", ["Girls", "Solo", "Love"], "http://www.blackpink.com", "Bighit", ["Rose", "Lisa", "Jennie", "Jisso"], 2014);
    //   console.log(createBand);
    // } catch (e) {
    //   console.log(e);
    // }
  }
  main()