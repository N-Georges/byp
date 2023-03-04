import "@/styles/globals.css";
import type { AppProps } from "next/app";
import withUrql from "../../utils/client";
import { ApolloProvider } from "@apollo/client";
import client from "@/clients/apollo-client";

function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default App;
