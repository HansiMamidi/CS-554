// Import the express router as shown in the lecture code
// Note: please do not forget to export the router!

import {Router} from 'express';
const router = Router();
import {recipesData} from '../data/index.js';
import {reviewsData} from '../data/index.js';
import validation from '../helpers.js';
import userData from '../data/users.js'

router
  .route('/recipes')
  .get(async (req, res) => {
    try {
      const recipesList = await recipesData.getAll();
      res.status(200).json(recipesList);
    } catch (e) {
      res.status(500).json({error: e});
    }
  })
  .post(async (req, res) => {
    const reqRecipeData = req.body;
    console.log(req.body)
    if (!reqRecipeData || Object.keys(reqRecipeData).length === 0) {
      return res
        .status(400)
        .json({error: 'There are no fields in the request body'});
    }

    // try {
    //   reqBandData.name = validation.checkString(reqBandData.name, 'Name');
    //   reqBandData.genre = validation.checkStringArray(reqBandData.genre, 'Genre');
    //   reqBandData.website = validation.checkString(reqBandData.website, 'Website');
    //   reqBandData.recordCompany = validation.checkString(reqBandData.recordCompany, 'Record Company');
    //   reqBandData.groupMembers = validation.checkStringArray(reqBandData.groupMembers, 'Group Members');
    //   reqBandData.yearBandWasFormed = validation.checkNumber(reqBandData.yearBandWasFormed, 'Year Band Was Formed');
    // } catch (e) {
    //   return res.status(400).json({error: e});
    // }

    try {
      const {title,ingredients, skillLevel, steps} = reqRecipeData;
      if(!req.session.user) throw[400,"You must be logged in to create a new recipe"]
      const newRecipe = await recipesData.create(title,ingredients, skillLevel, steps, req.session.user);
      res.status(200).json(newRecipe);
    } catch (e) {
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      res.status(status).json({error: message});
    } 
  });

router
  .route('/recipes/:id')
  .get(async (req, res) => {
    try {
      req.params.id = validation.checkId(req.params.id, 'Id URL Param');
    } catch (e) {
      return res.status(400).json({error: e});
    }
    try {
      const recipe = await recipesData.get(req.params.id);
      res.status(200).json(recipe);
    } catch (e) {
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      res.status(status).json({error: message});
    }
  })
  .patch(async (req, res) => {
    try {
      let updated_details = req.body;
      let recipeId = req.params.id;
      let existingData = await recipesData.get(recipeId.toString());
      if(!existingData) throw [400, "No recipe found with the ID"]
      let flag=false
      if(req.body.title ||req.body.ingredients || req.body.skillLevel || req.body.steps){
        flag=true
      }
      else if(req.body.reviews || req.body.user ||req.body.likes){
        throw [400,"Cannot update reviews, likes and user details"]
      }
      else if(req.body.title && req.body.title!==existingData.title){
        throw [400, "You must be the one who posted the recipe to update the recipe"]
      }

      if(flag===true){
        let insertData = await recipesData.update(existingData._id.toString(),updated_details)
        res.status(200).json(insertData);

      }
      
    } catch (e) {
      res.status(500).json({ error: e });
    }
  })
  .put(async (req, res) => {
    const updatedData = req.body;
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res
        .status(400)
        .json({error: 'There are no fields in the request body'});
    }
    try {
      req.params.id = validation.checkId(req.params.id, 'ID url param');
      updatedData.name = validation.checkString(updatedData.name, 'Name');
      updatedData.genre = validation.checkStringArray(updatedData.genre, 'Genre');
      updatedData.website = validation.checkString(updatedData.website, 'Website');
      updatedData.recordCompany = validation.checkString(updatedData.recordCompany, 'Record Company');
      updatedData.groupMembers = validation.checkStringArray(updatedData.groupMembers, 'Group Members');
      updatedData.yearBandWasFormed = validation.checkNumber(updatedData.yearBandWasFormed, 'Year Band Was Formed');
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      const {name, genre, website, recordCompany, groupMembers, yearBandWasFormed} = updatedData;
      const newBand = await bandData.update(
        req.params.id,
        name, genre, website, recordCompany, groupMembers, yearBandWasFormed
      );
      res.status(200).json(newBand);
    } catch (e) {
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      res.status(status).json({error: message});
    }
  })

  

  router
  .route('/recipes/:id/reviews')
  // .get(async (req, res) => {
  //   try {
  //     const recipesList = await recipesData.getAll();
  //     res.status(200).json(recipesList);
  //   } catch (e) {
  //     res.status(500).json({error: e});
  //   }
  // })
  .post(async (req, res) => {
    //code here for POST
    let reviewInfo = req.body;
    if (!reviewInfo || Object.keys(reviewInfo).length === 0) {
      return res
        .status(400)
        .json({error: 'There are no fields in the request body'});
    }

    if(!reviewInfo.rating) throw [400,"Provide a rating to the recipe"]
    if(!reviewInfo.review) throw [400,"Provide a review to the recipe"]

    // try {
    //   albumInfo.title = validation.checkString(
    //     albumInfo.title,
    //     'Title'
    //   );
    //   albumInfo.releaseDate = validation.checkString(
    //     albumInfo.releaseDate,
    //     'Release Date'
    //   );
    //   albumInfo.tracks = validation.checkStringArray(
    //     albumInfo.tracks,
    //     'Tracks'
    //   );
    //   albumInfo.rating = validation.checkNumber(
    //     albumInfo.rating,
    //     'Rating'
    //   )
    // } catch (e) {
    //   return res.status(400).json({error: e});
    // }

    try {
      if(!req.session.user) throw [400, "You must login to post a review"]
      const newReview = await reviewsData.create(req.params.id.toString(), req.session.user,
        reviewInfo.rating,
        reviewInfo.review
      );
      console.log(newReview)
      res.status(200).json(newReview);
    } catch (e) {
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      res.status(status).json({error: message});
    }   
  });


  router
  .route('/recipes/:recipeId/:reviewId')
  .delete(async (req, res) => {
    // try {
    //   req.params.id = validation.checkId(req.params.id, 'Id URL Param');
    // } catch (e) {
    //   return res.status(400).json({error: e});
    // }
    try {
      if(!req.session.user) throw [400,"You must be logged in to delete the review"]
      let deletedReview = await reviewsData.remove(req.params.recipeId.toString(), req.params.reviewId.toString(),req.session.user);
      res.status(200).json(deletedReview);
    } catch (e) {
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      res.status(status).json({error: message});
    }
  });

  router
  .route('/recipes/:id/likes')
  .post(async (req, res) => {
    // if(!req.session.user) throw [400,"You must be logged in to like or unlike the recipe"]
    //code here for POST
    // let recipeId = req.params.id;
    // if (!recipeId || Object.keys(reviewInfo).length === 0) {
    //   return res
    //     .status(400)
    //     .json({error: 'There are no fields in the request body'});
    // }

    // if(!reviewInfo.rating) throw [400,"Provide a rating to the recipe"]
    // if(!reviewInfo.review) throw [400,"Provide a review to the recipe"]

    // try {
    //   albumInfo.title = validation.checkString(
    //     albumInfo.title,
    //     'Title'
    //   );
    //   albumInfo.releaseDate = validation.checkString(
    //     albumInfo.releaseDate,
    //     'Release Date'
    //   );
    //   albumInfo.tracks = validation.checkStringArray(
    //     albumInfo.tracks,
    //     'Tracks'
    //   );
    //   albumInfo.rating = validation.checkNumber(
    //     albumInfo.rating,
    //     'Rating'
    //   )
    // } catch (e) {
    //   return res.status(400).json({error: e});
    // }

    try {
      if(!req.session.user) throw [400, "You must login to post a review"]
      const newLike = await recipesData.updateLikes(req.params.id.toString());
      // console.log(newReview)
      res.status(200).json(newLike);
    } catch (e) {
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      res.status(status).json({error: message});
    }   
  });


  router
  .route('/signup')
  .post(async (req, res) => {
    //code here for POST
    // console.log("register post")
    
    try{
      let reg_details=req.body
      let name=reg_details.name;
    let username=reg_details.username;
    let password=reg_details.password;

    if(!name) throw 'Provide Name'
    if(!username) throw 'Provide username'
    if(!password) throw 'Please enter a password'

    if(name.trim().length===0) throw 'Name should not be a string of empty spaces'
    if(!name.match(/^[a-z ,.'-]+$/gi)){
      throw "Name shouldn't contain numbers"
    }
    if(!(name.length>1 | name.length<26)) throw ' Name should contain atleast 2 characters and less than 26 characters'

    if(username.trim().length===0) throw 'username should not be a string of empty spaces'
    // if(!username.match(/^[a-z ,.'-]+$/gi)){
    //   throw "username shouldn't contain numbers"
    // }
    if(!(username.length>4)) throw 'Username should contain atleast 5 characters'

    
    if(password.trim().length===0) throw 'Password is a string of empty spaces'
    if(!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/))
    throw 'Invalid Password format. Password should contain a minimum of 8 characters, atleast 1 uppercase letter, atleast 1 lowercase letter, 1 number and 1 special character'

    let insertData =await userData.createUser(name, username, password)
    // console.log("inserting",insertData)
    res.status(200).json(insertData);
    // return insertData
    } catch(e){
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      res.status(status).json({error: message});
    }
  });

  router
  .route('/login')
  .post(async (req, res) => {
    try{
      let login_details=req.body
      let username=login_details.username;
      let password=login_details.password;

      if(!username) throw [400,'Provide user names']
      if(!password) throw [400,'Enter Password']

      username=username.toLowerCase().trim()
      if(username.length===0) throw [400,'Username should not be a string of empty spaces']
 
      if(password.trim().length===0) throw [400,'Password is a string of empty spaces']
      if(!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/))
      throw [400,'Invalid Password format. Password should contain a minimum of 8 characters, atleast 1 uppercase letter, atleast 1 lowercase letter, 1 number and 1 special character']  

      let loginData =await userData.checkUser(username, password)
      // console.log(loginData)
      if(!loginData) res.status(400).json({error: "No user found with this username"});
      // res.status(400).render('login', {error: "Couldn't Login"}) 
      req.session.user= {_id:loginData._id.toString(), username: loginData.username}

      // console.log(req.session.user,"cookies")
      res.status(200).json(loginData);
      // if(loginData.role==="admin"){
      //   res.redirect("/admin")
      // }
      // else if(loginData.role==="user"){
      //   res.redirect("/protected")
      // }

    } catch(e){
      // console.log(e)
      res.status(400).json({error: e});
    }
  });

  router.route('/logout').get(async (req, res) => {
    if(!req.session.user) return res.status(400).json({message:"Not logged in"})
    
    req.session.destroy();
    // res.status(200).json({message:"You successfully logged out"});

    res.send('Logged out');
  });

export default router;