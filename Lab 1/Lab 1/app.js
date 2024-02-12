// This file should set up the express server as shown in the lecture code

import express from 'express';
const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';


app.use(express.json());
app.use(
  session({
    name: 'AuthCookie',
    secret: "This is a secret.. shhh don't tell anyone",
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 60000}
  })
);

app.use((req,res,next) => {
  console.log('['+new Date().toUTCString()+']:'+req.method+" "+req.originalUrl+' (Authenticated User)'); 
  next();
}
)

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});