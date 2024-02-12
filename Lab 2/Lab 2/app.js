// This file should set up the express server as shown in the lecture code

import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import redis from 'redis'
const client = redis.createClient();
client.connect().then(() => {});

app.use(express.json());

app.use('/api/characters/:id', async (req, res, next) => {
  //lets check to see if we have the show detail page for this show in cache
  if (
    req.originalUrl !== '/api/characters/history' && parseInt(req.params.id)
  ) {
    let exists = await client.exists(req.params.id);
    if (exists) {
      //if we do have it in cache, send the raw html from cache
      console.log('Character in Cache');
      let showDetailPage = await client.get(req.params.id);
      let historyData = await client.lPush('historyList',req.params.id)
      // console.log(await client.get('historyList'))
      console.log(historyData)

      res.json(JSON.parse(showDetailPage));
    } else {
      next();      
    }
  }
  else {
    next();
  }
});

app.use('/api/comics/:id', async (req, res, next) => {
  //lets check to see if we have the show detail page for this show in cache
 
    let exists = await client.exists(req.params.id+'<-comic');
    if (exists) {
      //if we do have it in cache, send the raw html from cache
      console.log('Comic in Cache');
      let showDetailPage = await client.get(req.params.id+'<-comic');
      res.json(JSON.parse(showDetailPage));
    } else {
      next();      
    }
  
});

app.use('/api/stories/:id', async (req, res, next) => {
  //lets check to see if we have the show detail page for this show in cache
    let exists = await client.exists(req.params.id+'<-story');
    if (exists) {
      //if we do have it in cache, send the raw html from cache
      console.log('Story in Cache');
      let showDetailPage = await client.get(req.params.id+'<-story');
      res.json(JSON.parse(showDetailPage));
    } else {
      next(); 
    }
});


configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});