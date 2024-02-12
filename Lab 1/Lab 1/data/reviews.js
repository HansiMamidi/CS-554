// This data file should export all functions using the ES6 standard as shown in the lecture code

import {ObjectId} from 'mongodb';
import validation from '../helpers.js';
import {recipes} from '../config/mongoCollections.js';
let exportedMethods = {
  async get(albumId) {

    if (!albumId) throw [400,'You must provide an albumId to search for'];
    if (typeof albumId !== 'string') throw [400,'albumId must be a string'];
    if (albumId.trim().length === 0)
      throw [400,'albumId cannot be an empty string or just spaces'];
      albumId = albumId.trim();
      if (albumId.toLowerCase()==="null" | albumId.toLowerCase()==="undefined" | albumId.toLowerCase()==="none" | albumId.toLowerCase()==="infinity" | albumId==="NaN"){
        throw [400,'Invalid input provided for albumId'];
      }
    if (!ObjectId.isValid(albumId)) throw [400,'invalid object albumId'];

    albumId = validation.checkId(albumId);
    let album=false
    const bandCollection = await bands();
    let bandList = await bandCollection.find({}).toArray();
    for(let i=0;i<bandList.length;i++)
    {
      let single_band=bandList[i]
      for(let [key,value] of Object.entries(single_band)){
        if(key==="albums"){
          let albumList=value
          for(let j=0;j<albumList.length;j++){
            for(let [key2,value2] of Object.entries(albumList[j])){
              if(new ObjectId(albumId).equals(value2)){
                return albumList[j]
              }
            }
          }
        }
      }   
    }
    
    if (!album) throw [404,'Album not found'];
    return album;
  },

  async getAll(bandId) {

    if (!bandId) throw [400,'You must provide an bandId to search for'];
    if (typeof bandId !== 'string') throw [400,'bandId must be a string'];
    if (bandId.trim().length === 0)
      throw [400,'bandId cannot be an empty string or just spaces'];
      bandId = bandId.trim();
      if (bandId.toLowerCase()==="null" | bandId.toLowerCase()==="undefined" | bandId.toLowerCase()==="none" | bandId.toLowerCase()==="infinity" | bandId==="NaN"){
        throw [400,'Invalid input provided for bandId'];
      }
    if (!ObjectId.isValid(bandId)) throw [400,'invalid object albumId'];

    bandId = validation.checkId(bandId);
    const bandCollection = await bands();
    const band = await bandCollection.findOne({_id: new ObjectId(bandId)});

    if (!band) throw [404,'Band not found'];
    
    if(!band.albums) throw [404,'Albums not found for this band'];
    return band.albums;
  },  
  async create(recipeId, sessionDetails, rating, review) {
    // console.log("reviews")

    if (!recipeId) throw [400,'You must provide an id to search for'];
    if (typeof recipeId !== 'string') throw [400,'Id must be a string'];

    if (recipeId.trim().length === 0) throw [400,'Id cannot be an empty string or just spaces'];
    recipeId = recipeId.trim();
    if (recipeId.toLowerCase()==="null" | recipeId.toLowerCase()==="undefined" | recipeId.toLowerCase()==="none" | recipeId.toLowerCase()==="infinity" | recipeId==="NaN"){
      throw [400,'Invalid input provided for recipeId'];
    }
    if (!ObjectId.isValid(recipeId)) throw [400,'invalid object recipeId'];

    if (!review) throw [400,'You must provide a review for the recipe'];
    if (typeof review !== 'string') throw [400,'review must be a string'];
    if (review.trim().length === 0) throw [400,'review cannot be an empty string or string with just spaces'];
    review = review.trim();

    if(review.length<25) throw [400,"Review must have atleast 25 characters"]
    const recipesCollection = await recipes();
    const oldData = await recipesCollection.findOne({_id: new ObjectId(recipeId)});

    // console.log("old first",oldData)
    // console.log(oldData)
    //checking for duplicate reviews
    for(let i=0;i<oldData.reviews.length;i++){
      if(review===oldData.reviews[i].review){
        throw [400, `Review already present in the recipe with ID ${recipeId}`];
      }
    }
    // console.log("Done")

    if (!rating) throw [400,'You must provide a rating for the album'];
    if (typeof rating !== 'number') throw [400,'Rating must be a number'];
    if((rating>=1 && rating<=5)===false) throw [400,'Rating must be a number between 1 to 5'];
    rating=Math.round(rating*10)/10

    // recipeId = validation.checkId(bandId, 'Recipe ID');
    // review = validation.checkString(review, 'Review');
    // rating = validation.checkNumber(rating, 'Rating');
    let oldReviews=[]
    // console.log(oldData.reviews,"old reviews")
    let newReview = {
      _id: new ObjectId(),
      user: {"_id":new ObjectId(sessionDetails._id), "username": sessionDetails.username},
      rating: rating,
      review: review
    };
    // console.log("new reviews", newReview)

    // const recipeReviews= await this.get(recipeId.review);
    oldReviews=oldData.reviews
    oldReviews.push(newReview)

    // console.log(oldReviews)
    // let sum=0
    // for(let i=0;i<oldReviews.length;i++){
    //   sum+=oldAlbums[i].rating
    // }
    // let Rating_avg= Math.round((sum/oldAlbums.length)*10)/10

    let updatedRecipeData = {
      title: oldData.title,
      ingredients: oldData.ingredients,
      skillLevel: oldData.skillLevel,
      steps: oldData.steps,
      user: oldData.user,
      reviews: oldReviews, 
      likes: oldData.likes
    };

    const updateInfo = await recipesCollection.findOneAndReplace(
      {_id: new ObjectId(recipeId)},
      updatedRecipeData,
      {returnDocument: 'after'}
    );
    if (updateInfo.lastErrorObject.n === 0)
      throw [404, `Update failed! Could not update post with id ${recipeId}`];

    const resultRecipe = await recipesCollection.findOne({_id: new ObjectId(recipeId)});
    return resultRecipe;
  },
  async remove(recipeId,reviewId, sessionDetails) {
    // console.log("remove")

    if (!recipeId) throw [400,'You must provide an recipeId to search for'];
    if (typeof recipeId !== 'string') throw [400,'recipeId must be a string'];
    if (recipeId.trim().length === 0)
      throw [400,'recipeId cannot be an empty string or just spaces'];
      recipeId = recipeId.trim();
      if (recipeId.toLowerCase()==="null" | recipeId.toLowerCase()==="undefined" | recipeId.toLowerCase()==="none" | recipeId.toLowerCase()==="infinity" | recipeId==="NaN"){
        throw [400,'Invalid input provided for recipeId'];
      }
    if (!ObjectId.isValid(recipeId)) throw [400,'invalid object recipeId'];

    if (!reviewId) throw [400,'You must provide an reviewId to search for'];
    if (typeof reviewId !== 'string') throw [400,'reviewId must be a string'];
    if (reviewId.trim().length === 0)
      throw [400,'reviewId cannot be an empty string or just spaces'];
      reviewId = reviewId.trim();
      if (reviewId.toLowerCase()==="null" | reviewId.toLowerCase()==="undefined" | reviewId.toLowerCase()==="none" | reviewId.toLowerCase()==="infinity" | reviewId==="NaN"){
        throw [400,'Invalid input provided for reviewId'];
      }
    if (!ObjectId.isValid(reviewId)) throw [400,'invalid object reviewId'];

    // albumId = validation.checkId(albumId);
    const recipeCollection = await recipes();
    let recipeList = await recipeCollection.find({}).toArray();
    let flag=false
    for(let i=0;i<recipeList.length;i++)
    {
      let single_recipe=recipeList[i]
      // console.log("----------------",single_recipe,"single_recipe-------------------")
      if(single_recipe.reviews.length===0) continue
      for(let [key,value] of Object.entries(single_recipe)){
        // console.log(key, value,"pair")
        if(key==="reviews"){
          // console.log("KEYY*****************",key,value)
          // if(single_recipe[reviews].length===0) continue
          let reviewList=value
          // console.log(reviewList.length,"length")
          for(let j=0;j<reviewList.length;j++){
            // console.log("coming")
            // console.log(reviewList[i])
            // console.log(new ObjectId(sessionDetails._id),reviewList[j].user._id)
            if(new ObjectId(sessionDetails._id).equals(reviewList[j].user._id)){
              reviewList.splice(j,1)

                let updatedRecipeData = {
                  title: single_recipe.title,
                  ingredients: single_recipe.ingredients,
                  skillLevel: single_recipe.skillLevel,
                  steps: single_recipe.steps,
                  user: single_recipe.user,
                  reviews: reviewList, 
                  likes: single_recipe.likes, 
                };
                flag =true
                const updateInfo = await recipeCollection.findOneAndReplace(
                  {_id: single_recipe._id},
                  updatedRecipeData,
                  {returnDocument: 'after'}
                );
                if (updateInfo.lastErrorObject.n === 0)
                  throw [404, `No Review found with id ${reviewId}`];

                return {"reviewId":reviewId, "deleted": true};

            }

            

              }
          }
        }
       }
    if (flag===false)
      throw [404, `Could not find review with id of ${reviewId}`];
    
    else{
      throw [400, "You can delete only the review posted by you"];

    }
    

  }
};

export default exportedMethods;