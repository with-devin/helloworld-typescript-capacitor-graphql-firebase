export const typeDefs = `#graphql
  type Message {
    text: String!
    created_at: String
  }
  
  type Query {
    hello: Message!
  }
`;
