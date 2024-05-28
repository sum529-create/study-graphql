import { ApolloServer, gql } from "apollo-server";
import fetch from 'node-fetch';

let tweets = [
    {
        id: "1",
        text: "first one!",
        userId: "2",
    },
    {
        id: "2",
        text: "second one!",
        userId: "1",
    },
]
let users = [
    {
        id: "1",
        firstName: "kim",
        lastName: "coco"
    },
    {
        id: "2",
        firstName: "kim",
        lastName: "star"
    },
];

// Query는 필수적으로 작성해야함
// Query에서는 아래와 같이 취급한다.
// text: String -> GET /text
// 사용자가 뭔가를 request하게 하도록 하려면 type Query안에 적어줘야함
// GET /api/v1/tweets
// GET /api/v1/tweets/:id
// 일반적으로 데이터를 조작하는 것이 아닌 오로지 받는용도라면 GET
// 데이터를 받아서 사용할 거라면 POST -> mutation(ex. DB,..)
// Query는 주소로 사용을 할때 사용(값을 보내줄때), Mutation은 데이터를 사용/조작 할떄 사용
// query -> query{} 생략-> { }
const typeDefs = gql`
    type User{
        id: ID!
        firstName: String!
        lastName: String!
        """
        Is the sum of firstName + lastName as a string
        """
        fullName: String!
    }
    """
    Tweet object represents a resource for a Tweet
    """
    type Tweet{
        id: ID!
        text: String!
        author: User
    }
    type Query{ 
        allMovies: [Movie!]!
        allUsers: [User!]!
        allTweets: [Tweet!]!
        tweet(id: ID!): Tweet
        movie(id: String!): Movie
    }
    type Mutation {
        postTweet(text:String!, userId: ID!): Tweet!
        """
        Deletes a Tweet if found, else returns false
        """
        deleteTweet(id:ID!): Boolean!
    }
    type Movie {
        id: Int!
        url: String!
        imdb_code: String!
        title: String!
        title_english: String!
        title_long: String!
        slug: String!
        year: Int!
        rating: Float!
        runtime: Float!
        genres: [String]!
        summary: String
        description_full: String!
        synopsis: String
        yt_trailer_code: String!
        language: String!
        mpa_rating: String!
        background_image: String!
        background_image_original: String!
        small_cover_image: String!
        medium_cover_image: String!
        large_cover_image: String!
        state: String!
        torrents: [String]!
        date_uploaded: String!
        date_uploaded_unix: Float!

    }
`; // SDL : Schema Definition Language

// 누군가 query type안에 있는 tweet필드를 요청시,
// apollo server는 resolvers의 query type의 tweet func으로 가서
// 함수를 실행함
const resolvers = {
    Query: {
        allTweets(){
            return tweets
        },
        tweet(root, {id}){ // argument는 두번째 인자로 온다.
            return tweets.find((tweet) => tweet.id === id);
        },
        allUsers(){
            return users;
        },
        async allMovies(){ 
            try {
                const res = await fetch("https://yts.mx/api/v2/list_movies.json", {
                    headers:{
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                });
        
                const contentType = res.headers.get("Content-Type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await res.text(); // 응답 본문을 텍스트로 읽기
                    console.error('Response is not JSON:', text);
                    throw new Error("Expected JSON response but got something else");
                }
    
                const data = await res.json();
                return data.data.movies;
            } catch (error) {
                console.error('Failed to fetch:', error);
                throw new Error('Failed to fetch data')
            }
            // return fetch("https://yts.torrentbay.st/api/v2/list_movies.json").then((r) => r.json()).then((json)=>json.data.movies)
        },
        async movie(_,{id}){
            try {
                const res = await fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`, {
                    headers:{
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                });
        
                const contentType = res.headers.get("Content-Type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await res.text(); // 응답 본문을 텍스트로 읽기
                    console.error('Response is not JSON:', text);
                    throw new Error("Expected JSON response but got something else");
                }
    
                const data = await res.json();
                return data.data.movie;
            } catch (error) {
                console.error('Failed to fetch:', error);
                throw new Error('Failed to fetch data')
            }
        }
    },
    Mutation: {
        postTweet(_, {text, userId}){
            const newTweet = {
                id: tweets.length + 1,
                text,
            };
            tweets.push(newTweet);
            return newTweet;
        },
        deleteTweet(_, {id}){
            const tweet = tweets.find(tweet => tweet.id === id);
            if(!tweet) return false;
            tweets = tweets.filter(tweet => tweet.id !== id);
            return true;
        }
    },
    User: {
        fullName({firstName, lastName}){
            return `${firstName} ${lastName}`
        }
    },
    Tweet:{
        author({userId}){
            return users.find((user) => user.id === userId);
        }
    }
}

const server = new ApolloServer({typeDefs, resolvers})

server.listen().then(({url}) => {
    console.log(`Running on ${url}`);
});


// studio - Operation
// mutation($deleteTweetId: ID!){
//     deleteTweet(id: $deleteTweetId)
//   }
//   {
//     allTweets {
//       id
//       text
//       author {
//         fullName
//       }
//     }
//   }
//   {
//     allUsers {
//       firstName
//       id
//       lastName
//       fullName
//     }
//   }
//   {
//     allMovies {
//       id
//       title
//       rating
//       summary
//       genres
//     }
//   }
//   query ($movieId: String!) {
//     movie(id: $movieId) {
//       title
//       summary
//       small_cover_image
//     }
//   }