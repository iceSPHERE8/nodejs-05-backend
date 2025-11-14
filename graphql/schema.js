const { buildSchema } = require("graphql"); 

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        username: String!
        email: String!
        status: String!
        posts: [Post!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type AllPosts {
        posts: [Post!]!
        total: Int!
    }

    input UserInputData {
        username: String!
        email: String!
        password: String!
    }

    input PostInputData {
        title: String!
        content: String!
        imageUrl: String
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        fetchAllPosts(page: Int!): AllPosts!
        fetchOnePost(postId: String!): Post!
        fetchUserStatus(userId: ID!): User!
    }

    type RootMutation {
        createUser(userInput: UserInputData!): User!
        createPost(postInput: PostInputData!): Post!
        editPost(postId: String!, postInput: PostInputData!): Post!
        editUserStatus(userId: ID!, statusInput: String!): User!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }    
`);