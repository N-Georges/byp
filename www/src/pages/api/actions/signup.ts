import type { NextApiRequest, NextApiResponse } from "next";
import { generateJWT } from "../../../../utils/jwt";
import client from "@/clients/apollo-client";
import bcrypt from "bcrypt";
import checkMessage from "../../../../utils/checkMessage";
import {
  InsertFriendOne,
  InsertFriendOneMutation,
  InsertFriendOneMutationVariables,
} from "@/generated/graphql";

const notUnique = checkMessage("Uniqueness violation");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username, password }: { username?: string; password: string } =
    req.body;

  const hashedPass = await bcrypt.hash(password, 10);

  return client
    .mutate<InsertFriendOneMutation, InsertFriendOneMutationVariables>({
      mutation: InsertFriendOne,
      variables: {
        username,
        password: hashedPass,
      },
    })
    .then((result) => {
      if (result?.errors) {
        if (notUnique(result.errors?.map((e) => e.message))) {
          return res.status(400).json({ message: "Not Permitted" });
        } else {
          console.log("Bad Query", result.errors?.[0].message);
          return res.status(400).json({ message: "Error with query" });
        }
      } else {
        const friend = result.data?.insert_friend_one;
        if (!friend)
          return res.status(400).json({ message: "Something went wrong" });

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
