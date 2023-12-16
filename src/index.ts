import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { string } from "joi";
import { prismaClient } from "./lib/db";

async function init() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8000;

  app.use(express.json());

  //Create GQL Server
  const gqlServer = new ApolloServer({
    typeDefs: `
    type Query {
      hello: String
      say(name: String): String
    }
    type Mutation {
      createUser(firstName:String!, lastName:String!, email: String!, password: String!): Boolean
    }
    `, //Schema
    resolvers: {
      Query: {
        hello: () => `Hey there, I am a graphql server`,
        say: (_, { name }: { name: string }) => `Hey ${name}`,
      },
      Mutation: {
        createUser: async (
          _,
          {
            firstName,
            lastName,
            email,
            password,
          }: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
          }
        ) => {
          await prismaClient.user.create({
            data: {
              email,
              firstName,
              lastName,
              password,
              salt: "random_salt",
            },
          });
          return true;
        },
      },
    }, //
  });

  //Start the GQL Server
  await gqlServer.start();

  app.get("/", (req, res) => {
    res.json({ msg: "Server is running" });
  });

  app.use("/graphql", expressMiddleware(gqlServer));

  app.listen(PORT, () => console.log("Server is started on PORT ${PORT}"));
}

init();
