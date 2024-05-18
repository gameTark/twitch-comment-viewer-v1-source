import { DBUser } from "@schemas/twitch/User";
import { GraphQLObjectType, GraphQLString } from "graphql";

const UserType = new GraphQLObjectType<DBUser>({
  name: 'User',
  description: 'user',
  fields: () => ({
    id: globalIdField('id'),
    login: {
      type: GraphQLString,
      resolve: (user) => user.login,
    },
    displayName: {
      type: GraphQLString,
      resolve: (user) => user.displayName || user.login,
    },
    type: {
      type: GraphQLString,
      resolve: (user) => user.type,
    },
    description: {
      type: GraphQLString,
      resolve: (user) => user.description,
    },
    profileImageUrl: {
      type: GraphQLString,
      resolve: (user) => user.profileImageUrl,
    },
    offlineImageUrl: {
      type: GraphQLString,
      resolve: (user) => user.offlineImageUrl,
    },
  })
});

const QueryType = new GraphQLObjectType({
  name: "Query",
  description: "description all root queries",
  fields: () => ({
  }),
});
