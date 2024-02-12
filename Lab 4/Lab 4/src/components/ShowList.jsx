import React, {useState, useEffect} from 'react';
import axios from 'axios';
import SearchShows from './SearchShows';
import ShowListCard from './ShowListCard';
import {Card, Grid} from '@mui/material';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
import '../App.css';

const ShowList = () => {
  const [loading, setLoading] = useState(true);
  const [deptLoading, setDeptLoading] = useState(true);
  const [searchData, setSearchData] = useState(undefined);
  const [showsData, setShowsData] = useState(undefined);
  const [collectionUrls, setcollectionUrls] = useState([]);
  const [searchUrls, setSearchUrls] = useState([]);
  const [searchLength, setSearchLength] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCurrentPage,setSearchCurrentPage] = useState(1);
  const [pageLimit] = useState(50);
  const [searchLimit] = useState(20);
  const [departments, setDepartments] = useState(undefined);
  const pageUrl = useNavigate();
  
  let cardsData = null;
  let {page} = useParams();
  const validPage = new RegExp(/^[0-9]+$/)
  if(!validPage.test(page)){
    pageUrl('/Error1')
  }
  // console.log("page:",page)

  let location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const departmentIds = searchParams.get('departmentIds')

  if(isNaN(parseInt(page)) || (departmentIds && isNaN(parseInt(page)))){
    pageUrl('/Error1')
  }
  if(parseInt(page)>9706 || (departmentIds && parseInt(page)>9706)){
    pageUrl('/Error')
  }
  if(parseInt(page)<1 || (departmentIds && parseInt(page)<1)){
    pageUrl('/Error1')
  }
  const validDept = new RegExp(/^[0-9]+$/)
  if(departmentIds && !validDept.test(departmentIds)){
    pageUrl('/Error1')
  }
  if(departmentIds && isNaN(parseInt(departmentIds))){
    pageUrl('Error1')
  }
  if(departmentIds && parseInt(departmentIds)<1){
    pageUrl('/Error1')
  }
  if(departmentIds && parseInt(departmentIds)>21){
    pageUrl('/Error')
  }

  // console.log("department query",departmentIds,typeof(departmentIds))
  const [currentPage, setCurrentPage]=useState(parseInt(page))
  
  let last_index = currentPage * pageLimit
  let start_index = last_index - pageLimit
  
  // console.log("page",parseInt(page), start_index, last_index)

  useEffect(() => {
    console.log('on load useeffect');
    async function fetchData() {
      try {
        const {data} = await axios.get('https://collectionapi.metmuseum.org/public/collection/v1/objects');
        // console.log("data",data)
        const urls = data.objectIDs.map((objectId) => `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`);
        // console.log("URLs:", urls);
        
        const result = urls.slice(start_index,last_index)
        // console.log(result);

        setShowsData(data);
        setcollectionUrls(result);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, [currentPage]);
  
    useEffect(() => {
      console.log('on load useeffect - departmentIds');
      async function fetchData() {
        try {
            const departmentsData = await axios.get('https://collectionapi.metmuseum.org/public/collection/v1/departments');
            // console.log("just checking dept",departmentsData.data)
            const departmentsList = departmentsData.data
            // console.log("dept type check",typeof(departmentIds))
            departmentsList.departments.map((departments) => {
              // console.log("dept check",parseInt(departments.departmentId),parseInt(departmentIds),departments.departmentId === departmentIds)
              if(departments.departmentId === parseInt(departmentIds)){
            setDepartments(departments.displayName)  
            // console.log(departments.displayName)
          }})

          setDeptLoading(false);
        } catch (e) {
          console.log(e);
        }
      }
      fetchData();
    }, [departmentIds]);

  const totalObjects = showsData?showsData.total:''
  const totalPages = Math.ceil(totalObjects/pageLimit)
  // console.log("Total Pages",totalObjects,totalPages)
  const previousPage = () =>{ 
    currentPage>1? setCurrentPage(currentPage-1) :'' 
    pageUrl(`/collection/page/${currentPage-1}`)
  };
  const nextPage  = () =>{ 
    currentPage<totalPages? setCurrentPage(currentPage+1) :''
    pageUrl(`/collection/page/${currentPage+1}`)
  };

  // console.log("department set",departments?departments:"not yet")

  let search_start_index = (searchCurrentPage-1) * searchLimit
  let search_last_index = search_start_index + searchLimit
  // console.log("SEARCH INDEXES",search_start_index,search_last_index)
  useEffect(() => {
    console.log('search useEffect fired');
    async function fetchData() {
      try {
        console.log(`in fetch searchTerm: ${searchTerm}`);
        const {data} = await axios.get(
          'https://collectionapi.metmuseum.org/public/collection/v1/search?q=' + searchTerm
        );
        // console.log("search data111",data)
        const urls = data.objectIDs.map((objectId) => `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`);
        // console.log("URLs:", urls);
        const result = urls.slice(search_start_index,search_last_index)
        // console.log(result);
        // console.log("Search length",urls.length)
        
        // console.log("search data effect",data)
        setSearchLength(urls.length)
        setSearchData(data);
        setSearchUrls(result);
        // setSearchCurrentPage(1)
      } catch (e) {
        console.log(e);
      }
    }
    if (searchTerm) {
      // last_index = currentPage * searchLimit
      // start_index = last_index - searchLimit
      // setSearchCurrentPage(1)
      fetchData();
    }
  }, [searchTerm,searchCurrentPage]);

  const searchValue = async (value) => {
    setSearchTerm(value);
  };

  const searchPreviousPage = () =>{ 
    searchCurrentPage>1? setSearchCurrentPage(searchCurrentPage-1) :'' 
    // pageUrl(`/collection/page/${currentPage-1}`)
  };
  const searchNextPage  = () =>{ 
    searchCurrentPage<searchTotalPages? setSearchCurrentPage(searchCurrentPage+1) :''
    // pageUrl(`/collection/page/${currentPage+1}`)
  };

  const searchTotalObjects = searchData?searchData.total:0
  const searchTotalPages = Math.ceil(searchTotalObjects/searchLimit)
//   const searchTotalObjects = searchUrls ? searchUrls.length : 0;
// const searchTotalPages = Math.ceil(searchTotalObjects / searchLimit);

  // console.log(searchTotalPages,"search page nos")

  if (searchTerm) {
    
    // console.log("SEARCH URLS",searchUrls?searchUrls:"NONE")
    cardsData =
      searchData && searchUrls.length>0 ?( 
      searchUrls.map((url) => {
        return <>
        <p style={{color:'white'}}>here</p>
        <ShowListCard url={url} key={url} />
        </>;
      })):null;
      // console.log("search cardsData length",cardsData.length)
      
  } else {
    cardsData =
      showsData &&
      collectionUrls.map((url) => {
        if(departments){
          return <ShowListCard url={url} key={url} departments={departments}/>;
        }
        else{
          return <ShowListCard url={url} key={url} />;
        }
        
        
      });      
  }

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else if(departmentIds && deptLoading){
    return (<div>
      <h2> Loading Departments</h2>
      </div>);      
    }else {
    return (
      <div>
         
        <SearchShows searchValue={searchValue} />
        {searchLength && searchTerm && <h2>{searchLength} Results found</h2> }
        {searchTerm && <>
          <br />
        <br />
        <Grid
          container
          spacing={2}
          sx={{
            flexGrow: 1,
            flexDirection: 'row'
          }}
        >
          {cardsData}
        </Grid>
        <div>
        <button onClick={searchPreviousPage} disabled ={searchCurrentPage===1}> Search Previous</button>
        {searchCurrentPage}
        <button onClick = {searchNextPage} disabled ={searchCurrentPage===searchTotalPages}>Search Next</button>
      </div>
      </>}
        
        {!searchTerm && <>
          <br />
        <br />
        <Grid
          container
          spacing={2}
          sx={{
            flexGrow: 1,
            flexDirection: 'row'
          }}
        >
          {cardsData}
        </Grid>
        <div>
        <button onClick={previousPage} disabled ={currentPage===1}> Previous</button>
        {currentPage}
        <button onClick = {nextPage} disabled ={currentPage===9706}>Next</button>
      </div>
      </>}
      </div>
    );
  }
};

export default ShowList;
