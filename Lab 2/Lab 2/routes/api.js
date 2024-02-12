import {Router} from 'express';
const router = Router();
import axios from 'axios';
import redis from 'redis';
import md5 from 'blueimp-md5';

const client = redis.createClient();
client.connect().then(() => {});

router.get('/characters/history', async (req, res) => {
    try{
        let sample = await client.ping()
        let historyResult = await client.lRange('historyList',0,19)
        console.log("RESULT-----",historyResult)
        let historyData = []

        const publickey = '04d0ab97ea4d2e790ea42877d28cb66e';
        const privatekey = '46a5e8339a536455fd6a0f1fbc22e8604adbb93d';
        const ts = new Date().getTime();
        const stringToHash = ts + privatekey + publickey;
        const hash = md5(stringToHash);
        const baseUrl = 'https://gateway.marvel.com:443/v1/public/characters';
        const url = baseUrl + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash;
        let {data} = await axios.get(url);
        let lists = data.data.results
        console.log(url)

        for(let i=0;i<historyResult.length;i++){
            for(let j=0;j<lists.length;j++){
                if(historyResult[i]===lists[j].id.toString()){
                    console.log(historyResult[i],lists[j].id)
                    historyData.push(lists[j])
                }
            }         
            }
        console.log("history data", historyData.length)

        return res.json(historyData)


    }catch (e) {
        let status = e[0] ? e[0] : 500;
        let message = e[1] ? e[1] : 'Internal Server Error';
        res.status(status).json({error: message});
      }
  });

router.get('/characters/:id', async (req, res) => {
    try{
        let sample = await client.ping()
        console.log(sample)
        console.log('Character not cached');
        const publickey = '04d0ab97ea4d2e790ea42877d28cb66e';
        const privatekey = '46a5e8339a536455fd6a0f1fbc22e8604adbb93d';
        const ts = new Date().getTime();
        const stringToHash = ts + privatekey + publickey;
        const hash = md5(stringToHash);
        const baseUrl = 'https://gateway.marvel.com:443/v1/public/characters';
        const url = baseUrl + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash;
        let {data} = await axios.get(url);
        let lists = data.data.results
        console.log(url)

        for(let i=0;i<lists.length;i++){
            if(lists[i].id.toString()===req.params.id){
                        let gotit = await client.set(req.params.id, JSON.stringify(lists[i]));
                        
                        let historyData = await client.lPush('historyList',req.params.id)
                        console.log("history",historyData)
                        return res.status(200).json(lists[i])
                }          
            }
            return res.status(404).json({error: 'Character with that id not found'})
    }catch (e) {
        let status = e[0] ? e[0] : 500;
        let message = e[1] ? e[1] : 'Internal Server Error';
        res.status(status).json({error: message});
      }
  });


  router.get('/comics/:id', async (req, res) => {
    try{
        let sample = await client.ping()
        console.log(sample)
        console.log('Comic not cached');
        const publickey = '04d0ab97ea4d2e790ea42877d28cb66e';
        const privatekey = '46a5e8339a536455fd6a0f1fbc22e8604adbb93d';
        const ts = new Date().getTime();
        const stringToHash = ts + privatekey + publickey;
        const hash = md5(stringToHash);
        const baseUrl = 'https://gateway.marvel.com:443/v1/public/comics';
        const url = baseUrl + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash;
        console.log(url)
        let {data} = await axios.get(url);
        let lists = data.data.results

        for(let i=0;i<lists.length;i++){
            if(lists[i].id.toString()===req.params.id){
                        let gotit = await client.set(req.params.id+'<-comic', JSON.stringify(lists[i]));
                        
                        return res.status(200).json(lists[i])
                }          
            }
            return res.status(404).json({error: 'Comic with that id not found'})
    }catch (e) {
        let status = e[0] ? e[0] : 500;
        let message = e[1] ? e[1] : 'Internal Server Error';
        res.status(status).json({error: message});
      }
  });

  router.get('/stories/:id', async (req, res) => {
    try{
        let sample = await client.ping()
        console.log(sample)
        console.log('Story not cached');
        const publickey = '04d0ab97ea4d2e790ea42877d28cb66e';
        const privatekey = '46a5e8339a536455fd6a0f1fbc22e8604adbb93d';
        const ts = new Date().getTime();
        const stringToHash = ts + privatekey + publickey;
        const hash = md5(stringToHash);
        const baseUrl = 'https://gateway.marvel.com:443/v1/public/stories';
        const url = baseUrl + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash;
        console.log(url)
        let {data} = await axios.get(url);
        let lists = data.data.results

        for(let i=0;i<lists.length;i++){
            if(lists[i].id.toString()===req.params.id){
                        let gotit = await client.set(req.params.id+'<-story', JSON.stringify(lists[i]));
                        
                        return res.status(200).json(lists[i])
                }          
            }
            return res.status(404).json({error: 'Story with that id not found'})
    }catch (e) {
        let status = e[0] ? e[0] : 500;
        let message = e[1] ? e[1] : 'Internal Server Error';
        res.status(status).json({error: message});
      }
  });

  export default router;