import React, {useState, useEffect} from 'react';
import noImage from '../img/download.jpeg';
import Show from './Show';
import {Link, Route, Routes,useNavigate} from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography
} from '@mui/material';

function ShowListCard({url, departments}) {
  const regex = /(<([^>]+)>)/gi;
  const navigate = useNavigate();
  const [show, setShow] = useState(undefined);
  // console.log(departments,"showlistCard")
  if(departments){
    // console.log('department in')
    // console.log(depart)
    useEffect(() => {
      console.log('on load useeffect - departments exist');
      async function fetchData() {
        try {
          // console.log(url)
          const {data} = await axios.get(url);
          // console.log("types",data.department,departments)
          if(data.department===departments){
            // console.log("YUPPPPPP SAME")
            setShow(data);
          }
          else{
            // console.log("NOT SAME")
            return null;
          }
          // console.log("showlist department data",data)

        } catch (e) {
          console.log(e);
        }
      }
      fetchData();
    }, [url]);

  }else{
    useEffect(() => {
      console.log('on load useeffect');
      async function fetchData() {
        try {
          // console.log(url)
          const {data} = await axios.get(url);
          // console.log("showlist card data",data)
          setShow(data);
          // setcollectionUrls(urlData);
          // setLoading(false);
        } catch (e) {
          console.log(e);
        }
      }
      fetchData();
    }, [url]);

  }

  const handleClick =()=>{
    if(show){
      navigate(`/collection/${show.objectID}`)
    }
  }
  return show? (
    <Grid item xs={12} sm={7} md={5} lg={4} xl={3} key={show.objectID}>
      <Card
        variant='outlined'
        sx={{
          maxWidth: 250,
          color:  '#a82a2e',
          height: 'auto',
          marginLeft: 'auto',
          marginRight: 'auto',
          borderRadius: 5,
          border: '1px solid #1e8678',
          boxShadow:
            '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);'
        }}
      >
        {/* <CardActionArea>YUPPP A BUTTON CHECK<Route path={`/collection/${show.objectID}`} element={<Show />} /> </CardActionArea> */}
        <Card onClick={handleClick} sx={{
          '&:hover':{
            cursor: 'pointer',
          },
          maxWidth: 250,
          color:  '#a82a2e',
          height: 'auto',
          marginLeft: 'auto',
          marginRight: 'auto',
          borderRadius: 5,
          border: '1px solid #1e8678',
          boxShadow:
            '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);'
        }}>
          {/* <Link to={`/collection/${show.objectID}`}> */}
          {/* <Routes>
          <Route path={`/collection/${show.objectID}`} element={<Show />} />
          </Routes> */}
          
          
            <CardMedia
              sx={{
                height: '100%',
                width: '100%'
              }}
              component='img'
              image={
                show.primaryImage
                  ? show.primaryImage.replace(/ /g,'_')
                  : noImage
              }
              title='show image'
            />

            <CardContent>
              <Typography
                sx={{
                  borderBottom: '1px solid #1e8678',
                  fontWeight: 'bold'
                }}
                gutterBottom
                variant='h6'
                component='h3'
              >
                {show.title?show.title:"N/A"}
              </Typography>
              <Typography
                sx={{
                  borderBottom: '1px solid #1e8678',
                  fontWeight: 'bold'
                }}
                gutterBottom
                variant='h6'
                component='h3'
              >
                
                {show.artistDisplayName?show.artistDisplayName:"N/A"}
              </Typography>
              <Typography
                sx={{
                  borderBottom: '1px solid #1e8678',
                  fontWeight: 'bold'
                }}
                gutterBottom
                variant='h6'
                component='h3'
              >
                Date:{show.objectBeginDate?show.objectBeginDate:"N/A"}-{show.objectEndDate?show.objectEndDate:"N/A"}
              </Typography>
            </CardContent>
          {/* </Link> */}
        </Card>
      </Card>
    </Grid>
  ):null;
  
}

export default ShowListCard;
