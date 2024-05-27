import { ApolloServer, gql } from "apollo-server";

// Query는 필수적으로 작성해야함
// Query에서는 아래와 같이 취급한다.
// text: String -> GET /text
// 사용자가 뭔가를 request하게 하도록 하려면 type Query안에 적어줘야함
// GET /api/v1/tweets
// GET /api/v1/tweets/:id
// 일반적으로 데이터를 조작하는 것이 아닌 오로지 받는용도라면 GET
// 데이터를 받아서 사용할 거라면 POST -> mutation(ex. DB,..)
// Query는 주소로 사용을 할때 사용(값을 보내줄때), Mutation은 데이터를 사용/조작 할떄 사용
const typeDefs = gql`
    type User{
        id: ID!
        username: String!
        firstName: String!
        lastName: String!
    }
    type Tweet{
        id: ID!
        text: String!
        author: User!
    }
    type Query{ 
        allTweets: [Tweet!]!
        tweet(id: ID!): Tweet
    }
    type Mutation {
        postTweet(text:String!, userId: ID!): Tweet!
        deleteTweet(id:ID!): Boolean!
    }
`; // SDL : Schema Definition Language

const server = new ApolloServer({typeDefs})

server.listen().then(({url}) => {
    console.log(`Running on ${url}`);
});