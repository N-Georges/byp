import client from "@/clients/apollo-client";
import {
  Signup,
  SignupMutation,
  SignupMutationVariables,
} from "@/generated/graphql";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export enum AUTH {
  AUTHED = "authed",
  NOT_AUTHED = "not_authed",
}

type LocalUser = {
  authed: AUTH;
  id?: string;
  token?: string | null;
  username?: string | null;
};

type Byp = {
  user: LocalUser;
  signup: (username: string, password: string) => void;
  login: (username: string, password: string) => void;
  logout: () => void;
};

const useStore = create<Byp>()(
  devtools(
    persist(
      (set, get) => ({
        user: { authed: AUTH.NOT_AUTHED },
        signup: (username: string, password: string) => {
          client
            .mutate<SignupMutation, SignupMutationVariables>({
              mutation: Signup,
              variables: {
                username,
                password,
              },
            })
            .then((d) => {
              if (d.errors) {
                console.log(d.errors?.map((e) => e.message));
              } else {
                if (d.data?.signup) {
                  const { token, id, username } = d.data?.signup;
                  set({
                    user: { authed: AUTH.AUTHED, token, id, username },
                  });
                }
              }
            });
        },
        login: (username: string, password: string) => {},
        logout: () => {
          set({ user: { authed: AUTH.NOT_AUTHED } });
        },
      }),
      {
        name: "byp",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export { useStore };
