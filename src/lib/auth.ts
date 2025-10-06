import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import prisma from "./prisma";
import { buildSuggestionFromProfile, generateUniqueUsername } from "./username";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      async mapProfileToUser(profile: unknown) {
        const suggestion = buildSuggestionFromProfile(profile, [
          "preferred_username",
          "name",
          "given_name",
        ]);
        const { username, displayUsername } =
          await generateUniqueUsername(suggestion);
        return { username, displayUsername };
      },
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      async mapProfileToUser(profile: unknown) {
        const suggestion = buildSuggestionFromProfile(profile, [
          "login",
          "username",
          "name",
        ]);
        const { username, displayUsername } =
          await generateUniqueUsername(suggestion);
        return { username, displayUsername };
      },
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      async mapProfileToUser(profile: unknown) {
        const suggestion = buildSuggestionFromProfile(profile, [
          "global_name",
          "username",
          "name",
        ]);
        const { username, displayUsername } =
          await generateUniqueUsername(suggestion);
        return { username, displayUsername };
      },
    },
  },
  plugins: [nextCookies(), username()],
});
