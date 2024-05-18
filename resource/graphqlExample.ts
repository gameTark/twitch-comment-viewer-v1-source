// import DataLoader from "dataloader";
// import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
// import { fromGlobalId, globalIdField, nodeDefinitions } from "graphql-relay";

// type Parson = {
//   first_name: string;
//   last_name: string;
//   email: string;
//   username: string;
//   id: string;
// };
// const BASE_URL = "https://myapp.com/";
// const { nodeInterface, nodeField } = nodeDefinitions(
//   (globalId) => {
//     const { type, id } = fromGlobalId(globalId);
//     if (type === "Person") {
//       return personLoader.load(`/people/${id}/`);
//     }
//   },
//   (object) => {
//     if (object.hasOwnProperty("username")) {
//       return "Person";
//     }
//   },
// );
// function fetchResponseByURL(relativeURL: string) {
//   return fetch(`${BASE_URL}${relativeURL}`).then((res) => res.json());
// }

// function fetchPeople() {
//   return fetchResponseByURL("/people/").then((json) => json.people);
// }

// function fetchPersonByURL(relativeURL: string) {
//   return fetchResponseByURL(relativeURL).then((json) => json.person);
// }

// const personLoader = new DataLoader((urls) => Promise.all(urls.map(fetchPersonByURL)));
// const PersonType = new GraphQLObjectType<Parson>({
//   name: "Person",
//   description: "Somebody that you used to know",
//   fields: () => ({
//     id: globalIdField("Person"),
//     firstName: {
//       type: GraphQLString,
//       resolve: (person) => person.first_name,
//     },
//     lastName: {
//       type: GraphQLString,
//       resolve: (person) => person.last_name,
//     },
//     email: { type: GraphQLString },
//     username: { type: GraphQLString },
//   }),
//   interfaces: [nodeInterface],
// });

// const QueryType = new GraphQLObjectType({
//   name: "Query",
//   description: "description all root queries",
//   fields: () => ({
//     allPeople: {
//       type: new GraphQLList(PersonType),
//       resolve: (root) => {},
//     },
//     node: nodeField,
//     person: {
//       type: PersonType,
//       args: {
//         id: { type: GraphQLString },
//       },
//       resolve: (root, args) => personLoader.load(`/people/${args.id}/`),
//     },
//   }),
// });

// export default new GraphQLSchema({
//   query: QueryType,
// });
