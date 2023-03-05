import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

const isServerSide = typeof window === "undefined";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT,
});

// const wsLink = () =>
//   new GraphQLWsLink(
//     createClient({
//       url: (process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT as string).replace(
//         "http",
//         "ws"
//       ),
//       lazy: true,
//       connectionParams: async () => {
//         return !isServerSide
//           ? {
//               headers: {
//                 "Content-Type": "application/json",
//                 "x-hasura-admin-secret": process.env
//                   .HASURA_ADMIN_SECRET as string,
//               },
//             }
//           : {};
//       },
//     })
//   );
const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT_WS as string,
          lazy: true,
          connectionParams: async () => {
            return {
              headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": process.env
                  .HASURA_ADMIN_SECRET as string,
              },
            };
          },
        })
      )
    : null;

const splitLink = wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    )
  : httpLink;

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
