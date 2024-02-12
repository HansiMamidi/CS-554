import {GraphQLError} from 'graphql';

import {
  books as bookCollection,
  authors as authorCollection
} from './config/mongoCollections.js';

import {v4 as uuid} from 'uuid'; //for generating _id's
import {validate as isValidUUID} from 'uuid'
import redis from 'redis'
const client = redis.createClient();
client.connect().then(() => {});

/* parentValue - References the type def that called it
    so for example when we execute numOfEmployees we can reference
    the parent's properties with the parentValue Paramater
*/

/* args - Used for passing any arguments in from the client
    for example, when we call 
    addEmployee(firstName: String!, lastName: String!, employerId: Int!): Employee
		
*/

export const resolvers = {
  Query: {
    getAuthorById: async (_, args) => {
      args._id = args._id.trim()
  
        if(args._id.length===0){
          throw new GraphQLError(
            `_id is an empty string or string of spaces`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }
        args._id = args._id.toLowerCase()

        if(!isValidUUID(args._id)){
          throw new GraphQLError(
            `Invalid ID ${args._id}. Should be a valid UUID`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }
      let exists = await client.exists("author_"+args._id);
      if(exists){
        console.log("author by id cached")
        let cacheData = await client.get("author_"+args._id);
        return JSON.parse(cacheData)
      }
      console.log("author by id not cached")

      const authors = await authorCollection();
      const author = await authors.findOne({_id: args._id});
      if (!author) {
        //can't find the author
        throw new GraphQLError('Author Not Found', {
          extensions: {code: 'NOT_FOUND', http:{status:404}}
        });
      }
      await client.set("author_"+args._id,JSON.stringify(author));
      return author;
    },
    getBookById: async (_, args) => {
      args._id = args._id.trim()
  
        if(args._id.length===0){
          throw new GraphQLError(
            `_id is an empty string or string of spaces`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }
        args._id = args._id.toLowerCase()

        if(!isValidUUID(args._id)){
          throw new GraphQLError(
            `Invalid ID ${args._id}. Should be a valid UUID`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }
      let exists = await client.exists("book_"+args._id);

      if(exists){
        console.log("book by id cached")
        let cacheData = await client.get("book_"+args._id);
        return JSON.parse(cacheData)
      }
      console.log("book by id not cached")
      const books = await bookCollection();
      const book = await books.findOne({_id: args._id});
      if (!book) {
        //can't find the book
        throw new GraphQLError('Book Not Found', {
          extensions: {code: 'NOT_FOUND', http:{status:404}}
        });
      }
      await client.set("book_"+args._id,JSON.stringify(book));

      return book;
    },
    authors: async () => {
      
      let exists = await client.exists("allAuthorsCache");

      if(exists){
        console.log("authors cached")
        let cacheData = await client.get("allAuthorsCache");
        return JSON.parse(cacheData)
      }
      const authors = await authorCollection();
      const allAuthors = await authors.find({}).toArray();
      console.log("authors not cached")

      if (!allAuthors) {
        //Could not get list
        throw new GraphQLError(`Internal Server Error`, {
          extensions: {code: 'INTERNAL_SERVER_ERROR', http:{status:500}}
        });
      }
      await client.setEx("allAuthorsCache", 3600,JSON.stringify(allAuthors));

      return allAuthors;
    },
    books: async () => {
      let exists = await client.exists("allBooksCache");

      if(exists){
        console.log("books cached")
        let cacheData = await client.get("allBooksCache");
        return JSON.parse(cacheData)
      }

      console.log("books not cached")
      const books = await bookCollection();
      const allBooks = await books.find({}).toArray();
      if (!allBooks) {
        //Could not get list
        throw new GraphQLError(`Internal Server Error`, {
          extensions: {code: 'INTERNAL_SERVER_ERROR', http:{status:500}}
        });
      }
      await client.setEx("allBooksCache", 3600,JSON.stringify(allBooks));
      return allBooks;
    },
    booksByGenre: async (_, args) => {

      if(((args.genre).trim()).length===0){
        throw new GraphQLError('Genre is an empty string or string with just spaces', {
        extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
      });
    }
    args.genre=args.genre.toLowerCase()

    let exists = await client.exists("genre_"+args.genre);

    if(exists){
      console.log("books by genre cached")
      let cacheData = await client.get("genre_"+args.genre);
      return JSON.parse(cacheData)
    }
    console.log("books by genre not cached")

      const books = await bookCollection();
      const allBooks = await books.find({}).toArray();
      let bookList=[]
      for(let i=0; i<allBooks.length; i++){
        
        for(let j=0;j<allBooks[i].genres.length;j++){
          // console.log(args.genre, allBooks[i][j].genres)
          if(((allBooks[i].genres)[j]).toLowerCase()===(args.genre).toLowerCase()){
            // console.log("yup")
            bookList.push(allBooks[i])
          }
        }
      }
      if (!bookList.length>0) {
        //can't find the books
        throw new GraphQLError('Books with this genre Not Found', {
          extensions: {code: 'NOT_FOUND'}
        });
      }
      await client.setEx("genre_"+args.genre, 3600, JSON.stringify(bookList));
      return bookList;
    },
    booksByPriceRange: async (_, args) => {

      if (!(args.min%1 ===0 || !Number.isInteger(args.min))) {
        throw new GraphQLError('min must be a float or whole number', {
          extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
        });
      }

      if (!(args.max%1 ===0 || !Number.isInteger(args.max))) {
        throw new GraphQLError('max must be a float or whole number', {
          extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
        });
      }

      let exists = await client.exists("price_"+args.min+"-"+args.max);

      if(exists){
        console.log("books by price cached")
        let cacheData = await client.get("price_"+args.min+"-"+args.max);
        return JSON.parse(cacheData)
      }
      console.log("books by price not cached")

      const books = await bookCollection();
      const allBooks = await books.find({}).toArray();
      let bookList =[]
      for(let i=0;i<allBooks.length;i++){
        if(allBooks[i].price >=args.min && args.min <args.max && allBooks[i].price <=args.max){
          bookList.push(allBooks[i])
        }
        else if(args.max<=args.min){
          throw new GraphQLError('max must be greater then min', {
            extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
          });
        }
      }
      if (!bookList.length>0) {
        //can't find the books
        throw new GraphQLError('Books within this price range Not Found', {
          extensions: {code: 'NOT_FOUND', http:{status:404}}
        });
      }
      await client.setEx("price_"+args.min+"-"+args.max, 3600, JSON.stringify(bookList));

      return bookList;
    },
    searchAuthorsByName: async (_, args) => {
      args.searchTerm=args.searchTerm.trim().toLowerCase()  
      let exists = await client.exists("searchTerm_"+args.searchTerm);

      if(exists){
        console.log("authors by searchTerm cached")
        let cacheData = await client.get("searchTerm_"+args.searchTerm);
        return JSON.parse(cacheData)
      }   

      console.log("authors by searchTerm not cached")
      console.log(args.searchTerm) 
      // console.log("typr check",Number.isInteger(args.min),Number.isInteger(args.max))
      if(((args.searchTerm).trim()).length===0) {
        // console.log("min")
        //can't find the employee
        throw new GraphQLError('searchTerm is an empty string or string of spaces', {
          extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
        });
      }

      const authors = await authorCollection();
      const allAuthors = await authors.find({}).toArray();
      if (!allAuthors) {
        //Could not get list
        throw new GraphQLError(`Internal Server Error`, {
          extensions: {code: 'INTERNAL_SERVER_ERROR', http:{status:500}}
        });
      }

      let searchList=[]
      for(let i=0;i<allAuthors.length;i++){
        let firstName = allAuthors[i].first_name
        let lastName = allAuthors[i].last_name
        let nameValid = new RegExp(args.searchTerm,"i")
        if(nameValid.test(firstName) || nameValid.test(lastName)){
        // if(allAuthors[i].first_name.toLowerCase()===args.searchTerm || args.searchTerm===args.searchTerm){
          searchList.push(allAuthors[i])
        }
      }
      if (!searchList.length>0) {
        //can't find the employee
        throw new GraphQLError('Authors with this searchTerm Not Found', {
          extensions: {code: 'NOT_FOUND', http:{status:404}}
        });
      }
      await client.setEx("searchTerm_"+args.searchTerm, 3600, JSON.stringify(searchList));
      return searchList
    },
  },
  Author: {
    numOfBooks: async (parentValue) => {
      // console.log(`parentValue in Author`, parentValue);
      const books = await bookCollection();
      const numOfBooks = await books.count({
        authorId: parentValue._id
      });
      return numOfBooks;
    },
    books: async (parentValue,{limit}) => {
      const books = await bookCollection();
      const employs = await books
        .find({authorId: parentValue._id})
        .toArray();
        
        if(limit){
          if(typeof(limit)==="number" && limit>0){
            // console.log("yup")
            // console.log(limit,employs.slice(0,limit).length)
            return employs.slice(0,limit)
          }
          else{
            throw new GraphQLError('Invalid limit provided', {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            });
          }
          
        }
        else{
          return employs;
        }
      // return employs;
    }
  },
  Book: {
    author: async (parentValue) => {
      //console.log(`parentValue in Employee`, parentValue);
      parentValue.authorId = parentValue.authorId.trim()
  
        if(parentValue.authorId.length===0){
          throw new GraphQLError(
            `authorId is an empty string or string of spaces`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }
        parentValue.authorId = parentValue.authorId.toLowerCase()

        if(!isValidUUID(parentValue.authorId)){
          throw new GraphQLError(
            `Invalid ID ${parentValue.authorId}. Should be a valid UUID`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }
      const authors = await authorCollection();
      const author = await authors.findOne({_id: parentValue.authorId});
      return author;
    }
  },
  Mutation: {
      addBook: async (_, args) => {

        args.title = args.title.trim()
  
        if(args.title.length===0){
          throw new GraphQLError(
            `title is an empty string or string of spaces`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }
  
        // console.log(Array.isArray(args.genres), args.genres)
  
        if(args.genres.length===0){
          throw new GraphQLError(
            `genres must be an array of strings. No strings passed`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        for (let i in args.genres) {
          if (typeof args.genres[i] !== 'string' || args.genres[i].trim().length === 0) {
            throw new GraphQLError(
              `One or more genres is not a string or is an empty strings`,
              {
                extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
              }
            );
          }
          args.genres[i] = args.genres[i].trim();
        }

        args.publicationDate = args.publicationDate.trim()
  
        if(args.publicationDate.length===0){
          throw new GraphQLError(
            `publicationDate is an empty string or string of spaces`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        const validDate = new RegExp(/^(0*[1-9]|1[0-2])\/(0*[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/)

        if(!validDate.test(args.publicationDate)){
          throw new GraphQLError(
            `publicationDate must be of format MM/DD/YYYY`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        let checkDays = (args.publicationDate).split("/")

        if(checkDays[0]==="1" || checkDays[0]==="01" || checkDays[0]==="3" || checkDays[0]==="03"|| checkDays[0]==="5" || checkDays[0]==="05"
          || checkDays[0]==="7" || checkDays[0]==="07" || checkDays[0]==="8" ||checkDays[0]==="08" || checkDays[0]==="10" || checkDays[0]==="12"){
          if(parseInt(checkDays[1])>31){
            throw new GraphQLError(
              `Invalid Date`,
              {
                extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
              }
            );
          }
        } 
        else if(checkDays[0]==="4" || checkDays[0]==="04" || checkDays[0]==="6" || checkDays[0]==="06"|| checkDays[0]==="9" || checkDays[0]==="09"
          || checkDays[0]==="11"){
          if(parseInt(checkDays[1])>30){
            throw new GraphQLError(
              `Invalid Date`,
              {
                extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
              }
            );
          }
        } 
        else if(checkDays[0]==="2" || checkDays[0]==="02"){
          if(parseInt(checkDays[2]%4)===0){
            if(parseInt(checkDays[1])>29){
              throw new GraphQLError(
                `Leap year have only 29 days in February`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }            
          }
          else{
            if(parseInt(checkDays[1])>28){
              throw new GraphQLError(
                `Non-Leap year have only 28 days in February`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            } 
          }
        } 

        if(parseInt(checkDays[2])>2023){
          throw new GraphQLError(
            `Enter a previous date than today`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        } 


        args.publisher = args.publisher.trim()
  
        if(args.publisher.length===0){
          throw new GraphQLError(
            `publisher is an empty string or string of spaces`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        args.summary = args.summary.trim()
  
        if(args.summary.length===0){
          throw new GraphQLError(
            `summary is an empty string or string of spaces`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        args.isbn = args.isbn.trim()
  
        if(args.isbn.length===0){
          throw new GraphQLError(
            `isbn is an empty string or string of spaces`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        let isbnValid = new RegExp(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/,"i")
        if(!isbnValid.test(args.isbn)){
          throw new GraphQLError(
            `isbn must follow ISBN-10 or ISBN-13 format`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        args.language = args.language.trim()
  
        if(args.language.length===0){
          throw new GraphQLError(
            `language is an empty string or string of spaces`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        if(args.pageCount<=0){
          throw new GraphQLError(
            `pageCount should be greater than 0`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        if(args.price<=0){
          throw new GraphQLError(
            `price should be greater than 0`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }
  
        if(args.format.length===0){
          throw new GraphQLError(
            `format must be an array of strings. No strings passed`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        for (let i in args.format) {
          if (args.format[i].trim().length === 0) {
            throw new GraphQLError(
              `One or more formats is an empty strings or strings of spaces`,
              {
                extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
              }
            );
          }
          args.format[i] = args.format[i].trim();
        }

        args.authorId = args.authorId.trim()
  
        if(args.authorId.length===0){
          throw new GraphQLError(
            `authorId is an empty string or string of spaces`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        args.authorId = args.authorId.toLowerCase()

        if(!isValidUUID(args.authorId)){
          throw new GraphQLError(
            `Invalid ID ${args.authorId}. Should be a valid UUID`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        const books = await bookCollection();
        const authors = await authorCollection();
        // const checkBook = await books.findOne({title: args.title});

        // if(checkBook){
        //   throw new GraphQLError(
        //     `Book with this title already exists. Cannot create duplicates`,
        //     {
        //       extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
        //     }
        //   );
        // }

        const newBook = {
          _id: uuid(),
          title: args.title,
          genres: args.genres,
          publicationDate: args.publicationDate,
          publisher: args.publisher,
          summary: args.summary,
          isbn: args.isbn,
          language: args.language,
          pageCount: args.pageCount,
          price: args.price,
          format: args.format,
          authorId: args.authorId
        };

        let author = await authors.findOne({_id: args.authorId});
        if (!author) {
          throw new GraphQLError(
            `Could not Find Author with an ID of ${args.authorId}`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }
        let oldBooks = author.books
        oldBooks.push(newBook._id)
        author.books = oldBooks
        await authors.updateOne({_id: args.authorId}, {$set: author});
        

        const ageCheck = author.date_of_birth.split("/")
        ageCheck[2] = parseInt(ageCheck[2])
        if(ageCheck[2]>checkDays[2]){
          throw new GraphQLError(
            `PublicationDate should be after the date_of_birth`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        console.log(args.publicationDate,ageCheck)

        let insertedBook = await books.insertOne(newBook);
        if (!insertedBook.acknowledged || !insertedBook.insertedId) {
          throw new GraphQLError(`Could not Add Book`, {
            extensions: {code: 'INTERNAL_SERVER_ERROR', http:{status:500}}
          });
        }
        await client.set("book_"+newBook._id, JSON.stringify(newBook));
        
        return newBook;
      },
      removeBook: async (_, args) => {
        args._id = args._id.trim()
  
        if(args._id.length===0){
          throw new GraphQLError(
            `authorId is an empty string or string of spaces`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }
        args._id = args._id.toLowerCase()

        if(!isValidUUID(args._id)){
          throw new GraphQLError(
            `Invalid ID ${args._id}. Should be a valid UUID`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }

        const books = await bookCollection();
        const deletedBook = await books.findOneAndDelete({_id: args._id});
        if (!deletedBook) {
          throw new GraphQLError(
            `Could not delete book with _id of ${args._id}`,
            {
              extensions: {code: 'NOT_FOUND', http:{status:404}}
            }
          );
        }
        const authors = await authorCollection();
        const actionAuthor = await authors.findOne({_id: deletedBook.authorId})
        for(let i=0;i<actionAuthor.books.length;i++){
          if(actionAuthor.books[i]===deletedBook._id){
            actionAuthor.books.splice(i,1)
          }
        }
        await authors.updateOne({_id: actionAuthor._id}, {$set: actionAuthor});

        let exists = await client.exists("book_"+deletedBook._id);
        if(exists){
          await client.del("book_"+deletedBook._id);
        }

        return deletedBook;
      },
      editBook: async (_, args) => {
        args._id = args._id.trim()
  
        if(args._id.length===0){
          throw new GraphQLError(
            `_id is an empty string or string of spaces`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }
        args._id = args._id.toLowerCase()

        if(!isValidUUID(args._id)){
          throw new GraphQLError(
            `Invalid ID ${args._id}. Should be a valid UUID`,
            {
              extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
            }
          );
        }
        const books = await bookCollection();
        let newBook = await books.findOne({_id: args._id});
        let flag=0
        if (newBook) {
          if (args.title) {
            flag+=1
            args.title = args.title.trim()
            if(newBook.title === args.title){
              throw new GraphQLError(
                `title is same as old title`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
  
            if(args.title.length===0){
              throw new GraphQLError(
                `title is an empty string or string of spaces`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
            newBook.title = args.title;
          }
          if (args.genres) {
            flag+=1
            if(args.genres.length===0){
              throw new GraphQLError(
                `genres must be an array of strings. No strings passed`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
    
            for (let i in args.genres) {
              if (typeof args.genres[i] !== 'string' || args.genres[i].trim().length === 0) {
                throw new GraphQLError(
                  `One or more genres is not a string or is an empty strings`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
              args.genres[i] = args.genres[i].trim();
            }

            let genresFlag=0
            if(args.genres.length===newBook.genres.length){
              for(let i=0;i<args.genres.length;i++){
                if((args.genres)[i] !== (newBook.genres)[i]){
                  genresFlag+=1
                }
              }
            }

            if(genresFlag===0){
              throw new GraphQLError(
                `genres is same as old genres`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
            newBook.genres = args.genres;
          }
          if (args.publicationDate) {
            flag+=1
            args.publicationDate = args.publicationDate.trim()
  
            if(args.publicationDate.length===0){
              throw new GraphQLError(
                `publicationDate is an empty string or string of spaces`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }

            if(newBook.publicationDate === args.publicationDate){
              throw new GraphQLError(
                `publicationDate is same as old publicationDate`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
    
            const validDate = new RegExp(/^(0*[1-9]|1[0-2])\/(0*[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/)
    
            if(!validDate.test(args.publicationDate)){
              throw new GraphQLError(
                `publicationDate must be of format MM/DD/YYYY`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
    
            let checkDays = (args.publicationDate).split("/")

              if(checkDays[0]==="1" || checkDays[0]==="01" || checkDays[0]==="3" || checkDays[0]==="03"|| checkDays[0]==="5" || checkDays[0]==="05"
              || checkDays[0]==="7" || checkDays[0]==="07" || checkDays[0]==="8" ||checkDays[0]==="08" || checkDays[0]==="10" || checkDays[0]==="12"){
              if(parseInt(checkDays[1])>31){
                throw new GraphQLError(
                  `Invalid Date`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
            } 
            else if(checkDays[0]==="4" || checkDays[0]==="04" || checkDays[0]==="6" || checkDays[0]==="06"|| checkDays[0]==="9" || checkDays[0]==="09"
              || checkDays[0]==="11"){
              if(parseInt(checkDays[1])>30){
                throw new GraphQLError(
                  `Invalid Date`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
            } 
            else if(checkDays[0]==="2" || checkDays[0]==="02"){
              // console.log("month",checkDays[1])
              if(parseInt(checkDays[2]%4)===0){
                if(parseInt(checkDays[1])>29){
                  throw new GraphQLError(
                    `Leap year have only 29 days in February`,
                    {
                      extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                    }
                  );
                }            
              }
              else{
                if(parseInt(checkDays[1])>28){
                  throw new GraphQLError(
                    `Non-Leap year have only 28 days in February`,
                    {
                      extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                    }
                  );
                } 
              }
            } 

            if(parseInt(checkDays[2])>2023){
              throw new GraphQLError(
                `Enter a previous date than today`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            } 

            newBook.publicationDate = args.publicationDate;
          }
          if (args.publisher) {
            flag+=1
            args.publisher = args.publisher.trim()
  
            if(args.publisher.length===0){
              throw new GraphQLError(
                `publisher is an empty string or string of spaces`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }

            if(newBook.publisher === args.publisher){
              throw new GraphQLError(
                `publisher is same as old publisher`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
            newBook.publisher = args.publisher;
          }
          if (args.summary) {
            flag+=1
            args.summary = args.summary.trim()
  
            if(args.summary.length===0){
              throw new GraphQLError(
                `summary is an empty string or string of spaces`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }

            if(newBook.summary === args.summary){
              throw new GraphQLError(
                `summary is same as old summary`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
            newBook.summary = args.summary;
          }
          if (args.isbn) {
            flag+=1
            args.isbn = args.isbn.trim()
  
            if(args.isbn.length===0){
              throw new GraphQLError(
                `isbn is an empty string or string of spaces`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
            if(newBook.isbn === args.isbn){
              throw new GraphQLError(
                `isbn is same as old isbn`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
            newBook.isbn = args.isbn;
          }
          if (args.language) {
            flag+=1
            args.language = args.language.trim()
  
            if(args.language.length===0){
              throw new GraphQLError(
                `language is an empty string or string of spaces`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
            if(newBook.language === args.language){
              throw new GraphQLError(
                `language is same as old language`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
            newBook.language = args.language;
          }
          if (args.pageCount) {
            flag+=1

            if(newBook.pageCount === args.pageCount){
              throw new GraphQLError(
                `pageCount is same as old pageCount`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
            newBook.pageCount = args.pageCount;
          }
          if (args.price) {
            flag+=1

            if(newBook.price === args.price){
              throw new GraphQLError(
                `price is same as old price`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
            newBook.price = args.price;
          }
          if (args.format) {
            flag+=1
            if(args.format.length===0){
              throw new GraphQLError(
                `format must be an array of strings. No strings passed`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
    
            for (let i in args.format) {
              if (args.format[i].trim().length === 0) {
                throw new GraphQLError(
                  `One or more formats is an empty strings or strings of spaces`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
              args.format[i] = args.format[i].trim();
            }
            let formatFlag=0
            if(args.format.length===newBook.format.length){
              for(let i=0;i<args.format.length;i++){
                if((args.format)[i] !== (newBook.format)[i]){
                  formatFlag+=1
                }
              }
            }

            if(formatFlag===0){
              throw new GraphQLError(
                `format is same as old format`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
            newBook.format = args.format;
          }

          if (args.authorId) {
            flag+=1
            args.authorId = args.authorId.trim()
            args.authorId = args.authorId.toLowerCase()
            if(args.authorId.length===0){
              throw new GraphQLError(
                `authorId is an empty string or string of spaces`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }

            if(!isValidUUID(args.authorId)){
              throw new GraphQLError(
                `Invalid ID ${args.authorId}. Should be a valid UUID`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }

            if(newBook.authorId.toLowerCase() === args.authorId.toLowerCase()){
              throw new GraphQLError(
                `authorId is same as old authorId`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
            
            const authors = await authorCollection();
            const authorCount = await authors.count({_id: args.authorId});
            if (authorCount === 1) {
              newBook.authorId = args.authorId;
            } else {
              throw new GraphQLError(
                `Could not Find Author with an ID of ${args.authorId}`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
          }

            if(flag===0){
              throw new GraphQLError(
                `No new data given`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
          await books.updateOne({_id: args._id}, {$set: newBook});
        } else {
          throw new GraphQLError(
            `Could not update book with _id of ${args._id}`,
            {
              extensions: {code: 'NOT_FOUND', http:{status:404}}
            }
          );
        }
        let exists = await client.exists("book_"+newBook._id);
        if(exists){
          await client.del("book_"+newBook._id);
        }

        // await client.set("book_"+newBook._id, JSON.stringify(newBook));
        return newBook;
      },
    addAuthor: async (_, args) => {
      //check args

      args.first_name = args.first_name.trim()
      if(args.first_name.length===0){
        throw new GraphQLError(
          `first_name is an empty string or string of spaces`,
          {
            extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
          }
        );
      }

      const nameValid = /^[a-zA-Z]+$/
      if(!nameValid.test(args.first_name)){
        throw new GraphQLError(
          `first_name must contain only characters a-z and A-Z`,
          {
            extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
          }
        );
      }

      args.last_name = args.last_name.trim()

      if(args.last_name.length===0){
        throw new GraphQLError(
          `last_name is an empty string or string of spaces`,
          {
            extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
          }
        );
      }
      if(!nameValid.test(args.last_name)){
        throw new GraphQLError(
          `last_name must contain only characters a-z and A-Z`,
          {
            extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
          }
        );
      }

      args.date_of_birth = args.date_of_birth.trim()

      if(args.date_of_birth.length===0){
        throw new GraphQLError(
          `date_of_birth is an empty string or string of spaces`,
          {
            extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
          }
        );
      }
      const validDate = new RegExp(/^(0*[1-9]|1[0-2])\/(0*[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/)
    
      if(!validDate.test(args.date_of_birth)){
        throw new GraphQLError(
          `date_of_birth must be of format MM/DD/YYYY`,
          {
            extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
          }
        );
      }

      let checkDays = (args.date_of_birth).split("/")
      if(checkDays[0]==="1" || checkDays[0]==="01" || checkDays[0]==="3" || checkDays[0]==="03"|| checkDays[0]==="5" || checkDays[0]==="05"
              || checkDays[0]==="7" || checkDays[0]==="07" || checkDays[0]==="8" ||checkDays[0]==="08" || checkDays[0]==="10" || checkDays[0]==="12"){
              if(parseInt(checkDays[1])>31){
                throw new GraphQLError(
                  `Invalid Date`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
            } 
            else if(checkDays[0]==="4" || checkDays[0]==="04" || checkDays[0]==="6" || checkDays[0]==="06"|| checkDays[0]==="9" || checkDays[0]==="09"
              || checkDays[0]==="11"){
              if(parseInt(checkDays[1])>30){
                throw new GraphQLError(
                  `Invalid Date`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
            } 
            else if(checkDays[0]==="2" || checkDays[0]==="02"){
              // console.log("month",checkDays[1])
              if(parseInt(checkDays[2]%4)===0){
                if(parseInt(checkDays[1])>29){
                  throw new GraphQLError(
                    `Leap year have only 29 days in February`,
                    {
                      extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                    }
                  );
                }            
              }
              else{
                if(parseInt(checkDays[1])>28){
                  throw new GraphQLError(
                    `Non-Leap year have only 28 days in February`,
                    {
                      extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                    }
                  );
                } 
              }
            } 

            if(parseInt(checkDays[2])>2023){
              throw new GraphQLError(
                `Enter a previous date than today`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            } 


      args.hometownCity = args.hometownCity.trim()

      if(args.hometownCity.length===0){
        throw new GraphQLError(
          `hometownCity is an empty string or string of spaces`,
          {
            extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
          }
        );
      }

      args.hometownState = args.hometownState.trim()

      if(args.hometownState.length===0){
        throw new GraphQLError(
          `hometownState is an empty string or string of spaces`,
          {
            extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
          }
        );
      }

      if(!args.hometownState.length===2){
        throw new GraphQLError(
          `hometownState must contain only 2 letters`,
          {
            extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
          }
        );
      }

      const states = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
      ];

      if(!states.includes(args.hometownState.toUpperCase())){
        throw new GraphQLError(
          `Invalid state provided for hometownState`,
          {
            extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
          }
        );
      }

      const authors = await authorCollection();

      // const checkFirst = await authors.findOne({first_name: args.first_name});
      // const checkLast = await authors.findOne({last_name: args.last_name});

      // if(checkFirst && checkLast){
      //   throw new GraphQLError(
      //     `Author with this first name and last name exists. Cannot create duplicates`,
      //     {
      //       extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
      //     }
      //   );
      // }

      
      const newAuthor = {
        _id: uuid(),
        first_name: args.first_name,
        last_name: args.last_name,
        date_of_birth: args.date_of_birth,
        hometownCity: args.hometownCity,
        hometownState: args.hometownState,
        books:[]
      };
      let insertAuthor = await authors.insertOne(newAuthor);
      if (!insertAuthor.acknowledged || !insertAuthor.insertedId) {
        throw new GraphQLError(`Could not Add Author`, {
          extensions: {code: 'INTERNAL_SERVER_ERROR', http:{status:500}}
        });
      }
      await client.set("author_"+newAuthor._id, JSON.stringify(newAuthor));
      return newAuthor;
    },
    editAuthor: async (_, args) => {

          args._id = args._id.trim()
      
          if(args._id.length===0){
            throw new GraphQLError(
              `_id is an empty string or string of spaces`,
              {
                extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
              }
            );
          }
          args._id = args._id.toLowerCase()

          if(!isValidUUID(args._id)){
            throw new GraphQLError(
              `Invalid ID ${args._id}. Should be a valid UUID`,
              {
                extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
              }
            );
          }
          const authors = await authorCollection();
          let newAuthor = await authors.findOne({_id: args._id});
          // console.log(newAuthor);
          let flag =0
          if (newAuthor) {
            if (args.first_name) {
              flag+=1
              args.first_name = args.first_name.trim()
              if(args.first_name.length===0){
                throw new GraphQLError(
                  `first_name is an empty string or string of spaces`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
        
              const nameValid = /^[a-zA-Z]+$/
              if(!nameValid.test(args.first_name)){
                throw new GraphQLError(
                  `first_name must contain only characters a-z and A-Z`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }

              if(newAuthor.first_name === args.first_name){
                throw new GraphQLError(
                  `first_name is same as old first_name`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
              newAuthor.first_name = args.first_name;
            }
            if (args.last_name) {
              flag+=1
              args.last_name = args.last_name.trim()

              if(args.last_name.length===0){
                throw new GraphQLError(
                  `last_name is an empty string or string of spaces`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
              if(!nameValid.test(args.last_name)){
                throw new GraphQLError(
                  `last_name must contain only characters a-z and A-Z`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }

              if(newAuthor.last_name === args.last_name){
                throw new GraphQLError(
                  `last_name is same as old last_name`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
              newAuthor.last_name = args.last_name;
            }
            if (args.date_of_birth) {
              flag+=1
              args.date_of_birth = args.date_of_birth.trim()

              if(args.date_of_birth.length===0){
                throw new GraphQLError(
                  `date_of_birth is an empty string or string of spaces`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
              const validDate = new RegExp(/^(0*[1-9]|1[0-2])\/(0*[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/)
            
              if(!validDate.test(args.date_of_birth)){
                throw new GraphQLError(
                  `date_of_birth must be of format MM/DD/YYYY`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
        
              let checkDays = (args.date_of_birth).split("/")
              if(checkDays[0]==="1" || checkDays[0]==="01" || checkDays[0]==="3" || checkDays[0]==="03"|| checkDays[0]==="5" || checkDays[0]==="05"
              || checkDays[0]==="7" || checkDays[0]==="07" || checkDays[0]==="8" ||checkDays[0]==="08" || checkDays[0]==="10" || checkDays[0]==="12"){
              if(parseInt(checkDays[1])>31){
                throw new GraphQLError(
                  `Invalid Date`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
            } 
            else if(checkDays[0]==="4" || checkDays[0]==="04" || checkDays[0]==="6" || checkDays[0]==="06"|| checkDays[0]==="9" || checkDays[0]==="09"
              || checkDays[0]==="11"){
              if(parseInt(checkDays[1])>30){
                throw new GraphQLError(
                  `Invalid Date`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
            } 
            else if(checkDays[0]==="2" || checkDays[0]==="02"){
              // console.log("month",checkDays[1])
              if(parseInt(checkDays[2]%4)===0){
                if(parseInt(checkDays[1])>29){
                  throw new GraphQLError(
                    `Leap year have only 29 days in February`,
                    {
                      extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                    }
                  );
                }            
              }
              else{
                if(parseInt(checkDays[1])>28){
                  throw new GraphQLError(
                    `Non-Leap year have only 28 days in February`,
                    {
                      extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                    }
                  );
                } 
              }
            } 

            if(parseInt(checkDays[2])>2023){
              throw new GraphQLError(
                `Enter a previous date than today`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            } 


              if(newAuthor.date_of_birth === args.date_of_birth){
                throw new GraphQLError(
                  `date_of_birth is same as old date_of_birth`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
              newAuthor.date_of_birth = args.date_of_birth;
            }
            if (args.hometownCity) {
              flag+=1
              args.hometownCity = args.hometownCity.trim()

              if(args.hometownCity.length===0){
                throw new GraphQLError(
                  `hometownCity is an empty string or string of spaces`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }

              if(newAuthor.hometownCity === args.hometownCity){
                throw new GraphQLError(
                  `hometownCity is same as old hometownCity`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }

              newAuthor.hometownCity = args.hometownCity;
            }
            if (args.hometownState) {
              flag+=1
              args.hometownState = args.hometownState.trim()

              if(args.hometownState.length===0){
                throw new GraphQLError(
                  `hometownState is an empty string or string of spaces`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
        
              if(!args.hometownState.length===2){
                throw new GraphQLError(
                  `hometownState must contain only 2 letters`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
              const states = [
                'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
              ];
        
              if(!states.includes(args.hometownState.toUpperCase())){
                throw new GraphQLError(
                  `Invalid state provided for hometownState`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }

              if(newAuthor.hometownState === args.hometownState){
                throw new GraphQLError(
                  `hometownState is same as old hometownState`,
                  {
                    extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                  }
                );
              }
        
              newAuthor.hometownState = args.hometownState;
            }

            if(flag===0){
              throw new GraphQLError(
                `No new data given`,
                {
                  extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
                }
              );
            }
            
            await authors.updateOne({_id: args._id}, {$set: newAuthor});
          } else {
            throw new GraphQLError(
              `Could not update author with _id of ${args._id}`,
              {
                extensions: {code: 'INTERNAL_SERVER_ERROR', http:{status:500}}
              }
            );
          }
          let exists = await client.exists("author_"+newAuthor._id);
          if(exists){
            await client.del("author_"+newAuthor._id);
          }
          
          await client.set("author_"+newAuthor._id, JSON.stringify(newAuthor));
          
          return newAuthor;
        },
        removeAuthor: async (_, args) => {

          args._id = args._id.trim()
  
          if(args._id.length===0){
            throw new GraphQLError(
              `authorId is an empty string or string of spaces`,
              {
                extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
              }
            );
          }
          args._id = args._id.toLowerCase()
  
          if(!isValidUUID(args._id)){
            throw new GraphQLError(
              `Invalid ID ${args._id}. Should be a valid UUID`,
              {
                extensions: {code: 'BAD_USER_INPUT', http:{status:400}}
              }
            );
          }

          const authors = await authorCollection();
          const books = await bookCollection();
          const actionAuthor = await authors.findOne({_id: args._id})
          if(!actionAuthor){
            throw new GraphQLError(
              `No author found with _id of ${args._id}`,
              {
                extensions: {code: 'NOT_FOUND', http:{status:404}}
              }
            );
          }
          const deletedAuthor = await authors.findOneAndDelete({_id: args._id});
          // console.log(deletedAuthor)
          for(let i=0;i<actionAuthor.books.length;i++){
            // console.log(actionAuthor.books[i],"----\n")
            let deletedBook = await books.findOneAndDelete({_id: actionAuthor.books[i]})
            let exists = await client.exists("book_"+actionAuthor.books[i]);
            if(exists){
              await client.del("book_"+actionAuthor.books[i]);
            }
            
          }

          if (!deletedAuthor) {
            throw new GraphQLError(
              `Could not delete author with _id of ${args._id}`,
              {
                extensions: {code: 'INTERNAL_SERVER_ERROR', http:{status:500}}
              }
            );
          }
          let exists = await client.exists("author_"+deletedAuthor._id);
          if(exists){
            await client.del("author_"+deletedAuthor._id);
          }

          return deletedAuthor;
        },
  }
};