// This file will import both route files and export the constructor method as shown in the lecture code

/*
    - When the route is /bands use the routes defined in the bands.js routing file
    - When the route is /albums use the routes defined in albums.js routing file
    - All other enpoints should respond with a 404 as shown in the lecture code
*/

import recipesRoutes from './recipes.js';
// import usersRoutes from './users.js';
// import reviewsRoutes from './reviews.js';

const constructorMethod = (app) => {
  // app.use('/recipes', recipesRoutes);
  app.use('/', recipesRoutes);
  // app.use('/users', albumRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({error: 'Route Not found'});
  });
};

export default constructorMethod;