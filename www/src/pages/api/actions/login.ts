import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import client from "@/clients/apollo-client";

import {
  CheckFriend,
  CheckFriendQuery,
  CheckFriendQueryVariables,
} from "@/generated/graphql";
import { generateJWT } from "../../../../utils/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username, password }: { username?: string; password: string } =
    req.body;

  return client
    .query<CheckFriendQuery, CheckFriendQueryVariables>({
      query: CheckFriend,
      variables: {
        username,
      },
    })
    .then(async (result) => {
      if (result?.error) {
        console.log(result.error.graphQLErrors);
        return res.status(400).json({
          message: "Error with query",
          payload: result.error.graphQLErrors,
        });
      } else {
        const friend = result.data?.friend[0];
        if (!friend)
          return res.status(400).json({ message: "Something went wrong" });

        const validPassword = await bcrypt.compare(
          password,
          friend.password ?? ""
        );
        if (!validPassword) return res.status(401).send({ message: "Invalid" });

        const token = generateJWT({
          otherClaims: {
            "X-Hasura-User-Id": friend.id.toString(),
          },
        });

        return res.status(200).json({
          id: friend.id,
          username: friend.username,
          token,
        });
      }
    })
    .catch((e: any) => {
      console.log("server error");
      return res.status(400).json({ code: e.name, message: e.message });
    });
}
