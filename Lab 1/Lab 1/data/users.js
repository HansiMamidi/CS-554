// This data file should export all functions using the ES6 standard as shown in the lecture code

import {users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import validation from '../helpers.js';
import bcrypt from 'bcrypt';
const saltRounds = 16;

const exportedMethods = {
  async createUser(name, username, password) {
    // console.log("entering create user")
    if(!name) throw 'Provide Name'
    if(!username) throw 'Provide Last Name'
    // if(!emailAddress) throw 'Please enter Email Address'
    if(!password) throw 'Please enter a password'
    // if(!role) throw 'Please enter a role'

    // console.log(firstName.length, lastName, emailAddress, password, role)
    // console.log(firstName)
    if(name.trim().length===0) throw [400,'Name should not be a string of empty spaces']
    if(!name.match(/^[a-z ,.'-]+$/gi)){
      throw [400,"Name shouldn't contain numbers"]
    }
    if(!(name.length>2 | name.length<25)) throw [400,'Name should contain atleast 2 characters and less than 26 characters']
    
    if(username.trim().length===0) throw [400,'Username should not be a string of empty spaces']
    // if(!username.match(/^[a-z ,.'-]+$/gi)){
    //   throw "Username shouldn't contain numbers"
    // }
    if(!username.length>4) throw [400,'Username should contain atleast 5 characters']
    
    // emailAddress=emailAddress.toLowerCase().trim()
    // if(emailAddress.length===0) throw 'email address should not be a string of empty spaces'
    // if(!emailAddress.match(/^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/gi))
    // throw 'Invalid email address'

    const userCollection = await users();
    const userCheck = await userCollection.findOne({username: username});
    if(userCheck){
      throw [400,'Username already exists. Please Login']
    }
    let usersList = await userCollection.find({}).toArray();

    let usernameList=[]
    for(let i=0;i<usersList.length;i++){
      for(let [key,value] in usersList[i]){
        if(key===username){
          usernameList.push(usersList[i][key])
        }
      }
    }

     if(password.trim().length===0) throw [400,'Password is a string of empty spaces']
    if(!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/))
    throw [400,'Invalid Password format. Password should contain a minimum of 8 characters, atleast 1 uppercase letter, atleast 1 lowercase letter, 1 number and 1 special character']
    const hash = await bcrypt.hash(password, saltRounds);

    let newUser = {
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: hash
    };
    const newInsertInformation = await userCollection.insertOne(newUser);
    if (!newInsertInformation.insertedId) throw [400,'Insert failed!'];
    const user = await userCollection.findOne({_id: newInsertInformation.insertedId});
    // console.log(user)
    return {"_id": user._id.toString(),"name": user.name, "username":user.username}
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

    const userCollection = await users();
    const user = await userCollection.findOne({_id: new ObjectId(id)});
    if (user === null) throw [404,'No user with that id'];
    user._id = user._id.toString();
    return user
  },

  async getAll() {
    const userCollection = await users();
    let userList = await userCollection.find({}).toArray();
    if (!userList) throw [400,'Could not get all Users'];
    userList = userList.map((element) => {
      element._id = element._id.toString();
      return {"_id":element._id.toString(), "name":element.name};
    });
    return userList;
  },

  async remove(id) {
    if (!id) throw [400,'You must provide an id to search for'];
    if (typeof id !== 'string') throw [400,'Id must be a string'];
    if (id.trim().length === 0)
      throw [400,'id cannot be an empty string or just spaces'];
    id = id.trim();
      if (id.toLowerCase()==="null" | id.toLowerCase()==="undefined" | id.toLowerCase()==="none" | id.toLowerCase()==="infinity" | id==="NaN"){
        throw [400,'Invalid input provided for id'];
      }
    if (!ObjectId.isValid(id)) throw [400,'invalid object ID'];

    const bandCollection = await bands();
    const deletionInfo = await bandCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });

    if (deletionInfo.lastErrorObject.n === 0) {
      throw [404,`Could not delete band with id of ${id}`];
    }
    let result={"bandId": id, "deleted": true}
    return result;
  },

  async update(id, name, genre, website, recordCompany, groupMembers, yearBandWasFormed) {

    if (!id) throw [400,'You must provide an id to search for'];
    if (typeof id !== 'string') throw [400,'Id must be a string'];
    if (id.trim().length === 0)
      throw [400,'id cannot be an empty string or just spaces'];
    id = id.trim();
      if (id.toLowerCase()==="null" | id.toLowerCase()==="undefined" | id.toLowerCase()==="none" | id.toLowerCase()==="infinity" | id==="NaN"){
        throw [400,'Invalid input provided for id'];
      }
    if (!ObjectId.isValid(id)) throw [400,'invalid object ID'];

    if (!name) throw [400,'You must provide a name for your band'];
    if (typeof name !== 'string') throw [400,'Name must be a string'];
    if (name.trim().length === 0) throw [400,'Name cannot be an empty string or string with just spaces'];
    name = name.trim();
  
    if (!genre || !Array.isArray(genre))
      throw [400,'You must provide an array of genre'];
    if (genre.length === 0) throw [400,'You must supply at least one genre'];
    for (let i in genre) {
      if (typeof genre[i] !== 'string' || genre[i].trim().length === 0) {
        throw [400,'One or more genres is not a string or is an empty string'];
      }
      genre[i] = genre[i].trim();
    }
  
    if (!website) throw [400,'You must provide a website for your band'];
    if (typeof website !== 'string') throw [400,'website must be a string'];
    website=website.trim()
    if(!((website.startsWith('http://www.')) & (website.endsWith('.com')) & website.length>=20)){
      throw [400,'Website should start with http://www., end with .com & have atleast 5 characters between http.//www. and .com'];
    }
  
    if (!recordCompany) throw [400,'You must provide a Record Company for your band'];
    if (typeof recordCompany !== 'string') throw [400,'Record Company must be a string'];
    recordCompany=recordCompany.trim()
    if(recordCompany.length===0) throw [400,'Passed empty string for Record Company'];
  
    if (!groupMembers) throw [400,'You must provide Group Members for your band'];
    if (!groupMembers || !Array.isArray(groupMembers))
      throw [400,'You must provide an array of group members'];
    if (groupMembers.length === 0) throw [400,'You must supply at least one group member'];
    for (let i in groupMembers) {
      if (typeof groupMembers[i] !== 'string' || groupMembers[i].trim().length === 0) {
        throw [400,'One or more group members is not a string or is an empty string'];
      }
      groupMembers[i] = groupMembers[i].trim();
    }
  
    if (!yearBandWasFormed) throw [400,'You must provide an year for your band when its formed'];
    // if (typeof yearBandWasFormed !== 'number') throw [400,'Year Band Was Formed must be a number'];
    if (!(yearBandWasFormed%1 ===0)) throw [400, `Year must be a whole number`];
    if (!(yearBandWasFormed>=1900 & yearBandWasFormed<=2024)) throw [400,'You must provide a valid value. Only years 1900-2024 are valid values'];

    id = validation.checkId(id);
    name = validation.checkString(name, 'Name');
    genre = validation.checkStringArray(genre, 'Genre');
    website = validation.checkString(website, 'Website');
    recordCompany = validation.checkString(recordCompany, 'Record Company');
    groupMembers = validation.checkStringArray(groupMembers, 'Group Members');
    yearBandWasFormed = validation.checkNumber(yearBandWasFormed, 'Year Band Was Formed');

    const oldData = await this.get(id);
    let new_flag=false
    if(name!==oldData.name) new_flag=true
    if(genre.length!==oldData.genre.length) new_flag=true
    for(let i=0;i<genre.length;i++){
      if(genre[i]!==oldData.genre[i]) new_flag=true
    }

    if(website!==oldData.website) new_flag=true
    if(recordCompany!==oldData.recordCompany) new_flag=true
    if(groupMembers.length!==oldData.groupMembers.length) new_flag=true
    for(let i=0;i<groupMembers.length;i++){
      if(groupMembers[i]!==oldData.groupMembers[i]) new_flag=true
    }
    if(yearBandWasFormed!==oldData.yearBandWasFormed) new_flag=true
    if(new_flag===false) throw [400,'No new values to update'];
    let updatedBandData = {
      name: name,
      genre: genre,
      website: website,
      recordCompany: recordCompany,
      groupMembers: groupMembers,
      yearBandWasFormed: yearBandWasFormed, 
      albums: oldData.albums,
      overallRating: oldData.overallRating   
    };
    const bandCollection = await bands();
    const updateInfo = await bandCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      updatedBandData,
      {returnDocument: 'after'}
    );
    if (updateInfo.lastErrorObject.n === 0)
      throw [404, `Update failed! Could not update post with id ${id}`];

    const resultband = await bandCollection.findOne({_id: new ObjectId(id)});
    return resultband;
  },
  async checkUser(username, password) {

    const userCollection = await users();
    let userList = await userCollection.find({}).toArray();

    let usernameList=[]
    for(let i=0;i<userList.length;i++){
      let single_user=userList[i]
      usernameList.push(single_user.username)
    }
    let flag=false
    for(let i=0;i<usernameList.length;i++){
      if(username===usernameList[i]) {
        flag=true
      }
    }
    if(flag===false){
      throw [400,'Invalid Username']
    }
    for(let i=0;i<userList.length;i++){
      let single_user=userList[i]
      if(single_user.username===username){
        let hash = single_user.password
        let compareToPassword = false;
        compareToPassword = await bcrypt.compare(password, hash);
          // console.log(compareToPassword)
        if (compareToPassword) {
          return {"_id":single_user._id.toString(),"name":single_user.name,"username":single_user.username}
        } else {
          throw [400,'Passwords donot match']
        }
        
      }
    }   
  }


};

export default exportedMethods;