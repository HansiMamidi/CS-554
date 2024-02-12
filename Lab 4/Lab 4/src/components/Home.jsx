import React from 'react';
import ShowList from './ShowList';
import {Link, useParams} from 'react-router-dom';

function Home(props) {
  return (
    <>
      {/* <p>Welcome to the Metropolitan Museum of Art API</p> */}
      {/* <Route path='/collection/page/1' element={<ShowList />} /> */}
      <Link to='/collection/page/1'>Show all the Collection...</Link>
    </>
  );
}

export default Home;
