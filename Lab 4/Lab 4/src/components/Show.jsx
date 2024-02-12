import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useParams, useNavigate} from 'react-router-dom';
import noImage from '../img/download.jpeg';
import '../App.css';

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardHeader
} from '@mui/material';
import '../App.css';

const Show = (props) => {
  let {id} = useParams();   
  const navigate = useNavigate();
  const validId = new RegExp(/^[1-9]\d*$/)
  const invalidId = new RegExp(/^[0-9]*$/)
  
  //
  
  // console.log("show id check",id)
  // console.log(props)
  const [showData, setShowData] = useState(undefined);
  const [loading, setLoading] = useState(true);
   const [show, setShow] = useState(undefined);
  // console.log(url,"show.jsx data")

  useEffect(() => {
    
    console.log('SHOW useEffect fired');
    async function fetchData() {
      try {

        if(!validId.test(id)){
          // console.log("not valid")
          return navigate('/Error1')
        } else if(!invalidId.test(id)){
          // console.log("not valid")
          return navigate('/Error')
        } 
        
        
        const {data: show} = await axios.get(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
        );
        if(show){
          setShowData(show)
        }
        setLoading(false);
        // console.log("show",show)

      } catch (e) {
        console.log(e);
        
          navigate('/Error')
      
        
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
       
        <h2>Loading....</h2>
       
    );
  } else {
    // console.log("showData",showData);
    return (
      <Card
        variant='outlined'
        sx={{
          maxWidth: 550,
          height: 'auto',
          marginLeft: 'auto',
          marginRight: 'auto',
          borderRadius: 5,
          border: '1px solid #1e8678',
          boxShadow:
            '0 19px 38px rgba(0,0,0,0.30);'
        }}
      >
        <CardHeader
          title={showData.title}
          sx={{
            borderBottom: '1px solid #1e8678',
            fontWeight: 'bold',
            color:  '#a82a2e'
          }}
        />
        <CardMedia
          component='img'
          image={
            showData.primaryImage
              ? showData.primaryImage
              : noImage
          }
          title='show image'
        />

        <CardContent>       
               
                <dl>
                <dt className='title'>Artist's Display Name:</dt>
                {showData && showData.artistDisplayName ? ( 
                  <dd>{showData.artistDisplayName}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
                
               
               
                <dl>
                <dt className='title'>Artist's Display Bio:</dt>
                {showData && showData.artistDisplayBio ? (
                  <dd>{showData.artistDisplayBio}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
               
                <dl>
                <dt className='title'>Artist's Gender:</dt>
                {showData && showData.artistGender ? (
                  <dd>{showData.artistGender}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
               
                <dl>
                <dt className='title'>Date:</dt>
                {showData && (showData.objectBeginDate || showData.objectEndDate) ? (
                  <dd>{showData.objectBeginDate?showData.objectBeginDate:"N/A"}-{showData.objectEndDate?showData.objectEndDate:"N/A"}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
               
                <dl>
                <dt className='title'>Department:</dt>
                {showData && showData.department ? (
                  <dd>{showData.department}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
               
                <dl>
                <dt className='title'>Medium:</dt>
                {showData && showData.medium ? (
                  <dd>{showData.medium?showData.medium:"N/A"}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
               
                <dl>
                <dt className='title'>Classification:</dt>
                {showData && showData.classification ? (
                  <dd>{showData.classification?showData.classification:"N/A"}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
               
                <dl>
                <dt className='title'>Culture:</dt>
                {showData && showData.culture ? (
                  <dd>{showData.culture?showData.culture:"N/A"}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
               
                <dl>
                <dt className='title'>Dimensions:</dt>
                {showData && showData.dimensions ? (
                  <dd>{showData.dimensions?showData.dimensions:"N/A"}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
              
               
                <dl>
                <dt className='title'>Country:</dt>
                {showData && showData.country ? (
                  <dd>{showData.country?showData.country:"N/A"}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
              
               
                <dl>
                <dt className='title'>Excavation:</dt>
                {showData && showData.excavation ? (
                  <dd>{showData.excavation?showData.excavation:"N/A"}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
              
               
                <dl>
                <dt className='title'>Rights And Reproduction:</dt>
                {showData && showData.rightsAndReproduction ? (
                  <dd>{showData.rightsAndReproduction?showData.rightsAndReproduction:"N/A"}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
               
                <dl>
                <dt className='title'>Link Resource:</dt>
                {showData && showData.linkResource ? (
                  <dd>{showData.linkResource?showData.linkResource:"N/A"}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
               
                <dl>
                <dt className='title'>Repository:</dt>
                {showData && showData.repository ? (
                  <dd>{showData.repository?showData.repository:"N/A"}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
               
                <dl>
                <dt className='title'>Object URL:</dt>
                {showData && showData.objectURL ? (
                  <dd>{showData.objectURL?showData.objectURL:"N/A"}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
               
                <dl> 
                <dt className='title'>Object Wikidata URL:</dt>
                {showData && showData.objectWikidata_URL ? (
                  <dd>{showData.objectWikidata_URL?showData.objectWikidata_URL:"N/A"}</dd>
                ) : (
                  <dd>N/A</dd>
                )
              }
              </dl>

               
               
                <dl>
                <dt className='title'>Gallery Number:</dt>
                {showData && showData.GalleryNumber ? (
                  <dd>{showData.GalleryNumber?showData.GalleryNumber:"N/A"}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
                </dl>
               
            
            <Link to='/collection/page/1'>Back to all the Collection...</Link>
          {/*   */}
        </CardContent>
      </Card>
    );
  }
};

export default Show;
