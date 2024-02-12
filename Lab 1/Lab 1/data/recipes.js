// This data file should export all functions using the ES6 standard as shown in the lecture code
import {Router} from 'express';
const router = Router();
import {recipes} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import validation from '../helpers.js';

const exportedMethods = {
  async create(title,ingredients, skillLevel, steps, sessionDetails) {
    if (!title) throw [400,'You must provide a title for your recipe'];
    if (typeof title !== 'string') throw [400,'Title must be a string'];
    if (title.trim().length === 0) throw [400,'Title cannot be an empty string or string with just spaces'];
    title = title.trim();
    if (title.trim().length < 5) throw [400,'Title should contain atleast 5 characters'];
    title = title.trim();
  
    if (!ingredients || !Array.isArray(ingredients))
      throw [400,'You must provide an array of ingredients'];
    if (ingredients.length === 0 || ingredients.length < 4) throw [400,'You must supply at least 4 ingredients'];
    for (let i in ingredients) {
      if (typeof ingredients[i] !== 'string' || ingredients[i].trim().length === 0) {
        throw [400,'One or more ingredients is not a string or is an empty string'];
      }
      ingredients[i] = ingredients[i].trim();
    }
  
    if (!steps || !Array.isArray(steps))
      throw [400,'You must provide an array of steps'];
    if (steps.length === 0 || steps.length < 5) throw [400,'You must supply at least 5 steps'];
    for (let i in steps) {
      if (typeof steps[i] !== 'string' || steps[i].trim().length === 0) {
        throw [400,'One or more steps is not a string or is an empty string'];
      }
      steps[i] = steps[i].trim();
    }

    skillLevel=skillLevel.trim().toLowerCase();
    console.log(skillLevel)
    if(skillLevel!=="novice" && skillLevel !=="intermediate" && skillLevel !== "advanced"){
      throw [400,'Invalid cooking skill required error:  "Novice", "Intermediate", "Advanced"'];
    }

  //   if (!website) throw [400,'You must provide a website for your band'];
  //   if (typeof website !== 'string') throw [400,'website must be a string'];
  //   website=website.trim()
  //   if(!((website.startsWith('http://www.')) & (website.endsWith('.com')) & website.length>=20)) throw [400,'Website should start with http://www., end with .com & have atleast 5 characters between http.//www. and .com'];
 
  //   if (!recordCompany) throw [400,'You must provide a Record Company for your band'];
  //   if (typeof recordCompany !== 'string') throw [400,'Record Company must be a string'];
  //   recordCompany=recordCompany.trim()
  //   if(recordCompany.length===0) throw [400,'Passed empty string for Record Company'];
  
  //   if (!groupMembers) throw [400,'You must provide Group Members for your band'];
  //   if (!groupMembers || !Array.isArray(groupMembers))
  //     throw [400,'You must provide an array of group members'];
  //   if (groupMembers.length === 0) throw [400,'You must supply at least one group member'];
  //   for (let i in groupMembers) {
  //     if (typeof groupMembers[i] !== 'string' || groupMembers[i].trim().length === 0) {
  //       throw [400,'One or more group members is not a string or is an empty string'];
  //     }
  //     groupMembers[i] = groupMembers[i].trim();
  //   }
  
  //   if (!yearBandWasFormed) throw [400,'You must provide an year for your band when its formed'];
  //   // if (typeof yearBandWasFormed !== 'number') throw [400,'Year Band Was Formed must be a number'];
  //   if (!(yearBandWasFormed%1 ===0)) throw [400, `Year must be a whole number`];
  //   if (!(yearBandWasFormed>=1900 & yearBandWasFormed<=2024)) throw [400,'You must provide a valid value. Only years 1900-2024 are valid values'];
  
  // name = validation.checkString(name, 'Name');
  // genre = validation.checkStringArray(genre, 'Genre');
  // website = validation.checkString(website, 'Website');
  // recordCompany = validation.checkString(recordCompany, 'Record Company');
  // groupMembers = validation.checkStringArray(groupMembers, 'Group Members');
  // yearBandWasFormed = validation.checkNumber(yearBandWasFormed, 'Year Band Was Formed');
  
  const newRecipe = {
    title: title,
    ingredients: ingredients,
    skillLevel: skillLevel,
    steps: steps,
    user:{"_id":new ObjectId(sessionDetails._id),"username": sessionDetails.username},
    reviews: [],
    likes: []
  };

  const recipesCollection = await recipes();
  const insertInfo = await recipesCollection.insertOne(newRecipe);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw [400,'Could not add recipe'];

  const newId = insertInfo.insertedId;
  return await this.get(newId.toString());
  },
  
  async get(id) {
    if (!id) throw [400,'You must provide an id to search for'];
    if (typeof id !== 'string') throw [400,'Id must be a string'];
    if (id.trim().length === 0)
      throw [400,'id cannot be an empty string or just spaces'];
    id = id.trim();
      if (id.toLowerCase()==="null" | id.toLowerCase()==="undefined" | id.toLowerCase()==="none" | id.toLowerCase()==="infinity" | id==="NaN"){
        throw [400,'Invalid input provided for id'];
      }
    if (!ObjectId.isValid(id)) throw [400,'invalid object ID'];

    const recipesCollection = await recipes();
    const recipe = await recipesCollection.findOne({_id: new ObjectId(id)});
    if (recipe === null) throw [404,'No recipe with that id'];
    recipe._id = recipe._id.toString();
    return recipe
  },
  async getAll() {
    const recipesCollection = await recipes();
    let recipeList = await recipesCollection.find({}).toArray();
    if (!recipeList) throw [400,'Could not get all recipes'];
    recipeList = recipeList.map((element) => {
      element._id = element._id.toString();
      return {"_id":element._id.toString(), "title":element.title, "ingredients":element.ingredients, "skillLevel":element.skillLevel, "steps":element.steps, "reviews":element.reviews, "likes":element.likes};
    });
    return recipeList;
  },

  async update(id, updatedDetails) {

    if (!id) throw [400,'You must provide an id to search for'];
    if (typeof id !== 'string') throw [400,'Id must be a string'];
    if (id.trim().length === 0)
      throw [400,'id cannot be an empty string or just spaces'];
    id = id.trim();
      if (id.toLowerCase()==="null" | id.toLowerCase()==="undefined" | id.toLowerCase()==="none" | id.toLowerCase()==="infinity" | id==="NaN"){
        throw [400,'Invalid input provided for id'];
      }
    if (!ObjectId.isValid(id)) throw [400,'invalid object ID'];

    const oldData = await this.get(id);

    if(updatedDetails.title){
      oldData.title=updatedDetails.title
    }

    if(updatedDetails.ingredients){
      oldData.ingredients=updatedDetails.ingredients
    }

    if(updatedDetails.skillLevel){
      oldData.skillLevel=updatedDetails.skillLevel
    }

    if(updatedDetails.steps){
      oldData.steps=updatedDetails.steps
    }

    let updatedRecipeData = {
      title: oldData.title,
      ingredients: oldData.ingredients,
      skillLevel: oldData.skillLevel,
      steps: oldData.steps,
      user: oldData.user,
      reviews: oldData.reviews, 
      likes: oldData.likes  
    };

    const recipeCollection = await recipes();
    const updateInfo = await recipeCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      updatedRecipeData,
      {returnDocument: 'after'}
    );
    if (updateInfo.lastErrorObject.n === 0)
      throw [404, `Update failed! Could not update post with id ${id}`];

    const resultRecipe = await recipeCollection.findOne({_id: new ObjectId(id)});
    return resultRecipe;
  },
  async updateLikes(id) {

    if (!id) throw [400,'You must provide an id to search for'];
    if (typeof id !== 'string') throw [400,'Id must be a string'];
    if (id.trim().length === 0)
      throw [400,'id cannot be an empty string or just spaces'];
    id = id.trim();
      if (id.toLowerCase()==="null" | id.toLowerCase()==="undefined" | id.toLowerCase()==="none" | id.toLowerCase()==="infinity" | id==="NaN"){
        throw [400,'Invalid input provided for id'];
      }
    if (!ObjectId.isValid(id)) throw [400,'invalid object ID'];

    const oldData = await this.get(id);
    if(oldData.likes.length===0) oldData.likes.push(new ObjectId(id))
    else{
      for( let i=0;i<oldData.likes.length;i++){
        if(new ObjectId(id).equals(oldData.likes[i])){
          oldData.likes.splice(i,1)
        }
        else{
          oldData.likes.push(new ObjectId(id))
        }
      }
  }
    
    // console.log(oldData.likes)

    let updatedRecipeData = {
      title: oldData.title,
      ingredients: oldData.ingredients,
      skillLevel: oldData.skillLevel,
      steps: oldData.steps,
      user: oldData.user,
      reviews: oldData.reviews, 
      likes: oldData.likes  
    };

    const recipeCollection = await recipes();
    const updateInfo = await recipeCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      updatedRecipeData,
      {returnDocument: 'after'}
    );
    if (updateInfo.lastErrorObject.n === 0)
      throw [404, `Update failed! Could not update post with id ${id}`];

    const resultRecipe = await recipeCollection.findOne({_id: new ObjectId(id)});
    return resultRecipe;
  }

  // async remove(id) {
  //   if (!id) throw [400,'You must provide an id to search for'];
  //   if (typeof id !== 'string') throw [400,'Id must be a string'];
  //   if (id.trim().length === 0)
  //     throw [400,'id cannot be an empty string or just spaces'];
  //   id = id.trim();
  //     if (id.toLowerCase()==="null" | id.toLowerCase()==="undefined" | id.toLowerCase()==="none" | id.toLowerCase()==="infinity" | id==="NaN"){
  //       throw [400,'Invalid input provided for id'];
  //     }
  //   if (!ObjectId.isValid(id)) throw [400,'invalid object ID'];

  //   const bandCollection = await bands();
  //   const deletionInfo = await bandCollection.findOneAndDelete({
  //     _id: new ObjectId(id)
  //   });

  //   if (deletionInfo.lastErrorObject.n === 0) {
  //     throw [404,`Could not delete band with id of ${id}`];
  //   }
  //   let result={"bandId": id, "deleted": true}
  //   return result;
  // },

  // async update(id, name, genre, website, recordCompany, groupMembers, yearBandWasFormed) {

  //   if (!id) throw [400,'You must provide an id to search for'];
  //   if (typeof id !== 'string') throw [400,'Id must be a string'];
  //   if (id.trim().length === 0)
  //     throw [400,'id cannot be an empty string or just spaces'];
  //   id = id.trim();
  //     if (id.toLowerCase()==="null" | id.toLowerCase()==="undefined" | id.toLowerCase()==="none" | id.toLowerCase()==="infinity" | id==="NaN"){
  //       throw [400,'Invalid input provided for id'];
  //     }
  //   if (!ObjectId.isValid(id)) throw [400,'invalid object ID'];

  //   if (!name) throw [400,'You must provide a name for your band'];
  //   if (typeof name !== 'string') throw [400,'Name must be a string'];
  //   if (name.trim().length === 0) throw [400,'Name cannot be an empty string or string with just spaces'];
  //   name = name.trim();
  
  //   if (!genre || !Array.isArray(genre))
  //     throw [400,'You must provide an array of genre'];
  //   if (genre.length === 0) throw [400,'You must supply at least one genre'];
  //   for (let i in genre) {
  //     if (typeof genre[i] !== 'string' || genre[i].trim().length === 0) {
  //       throw [400,'One or more genres is not a string or is an empty string'];
  //     }
  //     genre[i] = genre[i].trim();
  //   }
  
  //   if (!website) throw [400,'You must provide a website for your band'];
  //   if (typeof website !== 'string') throw [400,'website must be a string'];
  //   website=website.trim()
  //   if(!((website.startsWith('http://www.')) & (website.endsWith('.com')) & website.length>=20)){
  //     throw [400,'Website should start with http://www., end with .com & have atleast 5 characters between http.//www. and .com'];
  //   }
  
  //   if (!recordCompany) throw [400,'You must provide a Record Company for your band'];
  //   if (typeof recordCompany !== 'string') throw [400,'Record Company must be a string'];
  //   recordCompany=recordCompany.trim()
  //   if(recordCompany.length===0) throw [400,'Passed empty string for Record Company'];
  
  //   if (!groupMembers) throw [400,'You must provide Group Members for your band'];
  //   if (!groupMembers || !Array.isArray(groupMembers))
  //     throw [400,'You must provide an array of group members'];
  //   if (groupMembers.length === 0) throw [400,'You must supply at least one group member'];
  //   for (let i in groupMembers) {
  //     if (typeof groupMembers[i] !== 'string' || groupMembers[i].trim().length === 0) {
  //       throw [400,'One or more group members is not a string or is an empty string'];
  //     }
  //     groupMembers[i] = groupMembers[i].trim();
  //   }
  
  //   if (!yearBandWasFormed) throw [400,'You must provide an year for your band when its formed'];
  //   // if (typeof yearBandWasFormed !== 'number') throw [400,'Year Band Was Formed must be a number'];
  //   if (!(yearBandWasFormed%1 ===0)) throw [400, `Year must be a whole number`];
  //   if (!(yearBandWasFormed>=1900 & yearBandWasFormed<=2024)) throw [400,'You must provide a valid value. Only years 1900-2024 are valid values'];

  //   id = validation.checkId(id);
  //   name = validation.checkString(name, 'Name');
  //   genre = validation.checkStringArray(genre, 'Genre');
  //   website = validation.checkString(website, 'Website');
  //   recordCompany = validation.checkString(recordCompany, 'Record Company');
  //   groupMembers = validation.checkStringArray(groupMembers, 'Group Members');
  //   yearBandWasFormed = validation.checkNumber(yearBandWasFormed, 'Year Band Was Formed');

  //   const oldData = await this.get(id);
  //   let new_flag=false
  //   if(name!==oldData.name) new_flag=true
  //   if(genre.length!==oldData.genre.length) new_flag=true
  //   for(let i=0;i<genre.length;i++){
  //     if(genre[i]!==oldData.genre[i]) new_flag=true
  //   }

  //   if(website!==oldData.website) new_flag=true
  //   if(recordCompany!==oldData.recordCompany) new_flag=true
  //   if(groupMembers.length!==oldData.groupMembers.length) new_flag=true
  //   for(let i=0;i<groupMembers.length;i++){
  //     if(groupMembers[i]!==oldData.groupMembers[i]) new_flag=true
  //   }
  //   if(yearBandWasFormed!==oldData.yearBandWasFormed) new_flag=true
  //   if(new_flag===false) throw [400,'No new values to update'];
  //   let updatedBandData = {
  //     name: name,
  //     genre: genre,
  //     website: website,
  //     recordCompany: recordCompany,
  //     groupMembers: groupMembers,
  //     yearBandWasFormed: yearBandWasFormed, 
  //     albums: oldData.albums,
  //     overallRating: oldData.overallRating   
  //   };
  //   const bandCollection = await bands();
  //   const updateInfo = await bandCollection.findOneAndReplace(
  //     {_id: new ObjectId(id)},
  //     updatedBandData,
  //     {returnDocument: 'after'}
  //   );
  //   if (updateInfo.lastErrorObject.n === 0)
  //     throw [404, `Update failed! Could not update post with id ${id}`];

  //   const resultband = await bandCollection.findOne({_id: new ObjectId(id)});
  //   return resultband;
  // }

};

export default exportedMethods;