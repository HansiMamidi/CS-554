import albums from './data/albums.js';
import {dbConnection, closeConnection} from './config/mongoConnection.js';


//drops the database each time this is run
const db = await dbConnection();
// await db.dropDatabase();
async function main() {

  try {
      const createAlbum = await albums.create("641f8f3fbbf01686ac7548a7", "Wish You Were Here","09/12/1975",["Shine On You Crazy Diamond, Pts. 1-5", "Welcome to the Machine","Have a Cigar (Ft. Roy Harper)", "Wish You Were Here","Shine On You Crazy Diamond, Pts. 6-9"], 5);
      console.log(createAlbum);
    } catch (e) {
      console.log(e);
    }
    try {
        const createAlbum = await albums.create("641f8f3fbbf01686ac7548a8", "BTS Purple Army","09/11/2020", ["Dynamite", "Smooth Like Butter","Dreamers", "Boy With Luv","Bulletproof Boys"], 5);
        console.log(createAlbum);
      } catch (e) {
        console.log(e);
      }
      try {
        const createAlbum = await albums.create("641f8f3fbbf01686ac7548a9","On the Ground", "01/12/2012",["Money", "Ice cream","Lalisa", "solo","Lovesick Girls"], 4.5);
        console.log(createAlbum);
      } catch (e) {
        console.log(e);
      }
  }
  main()