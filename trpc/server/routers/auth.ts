import { router, publicProcedure } from "../trpc"
import { signInSchema, signUpSchema } from "@/auth/nextjs/schemas"
import { UserTable, oAuthProviderEnum } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import {
  comparePasswords,
  generateSalt,
  hashPassword,
} from "@/auth/core/passwordHasher"
import { createUserSession, removeUserFromSession } from "@/auth/core/session"
import { getOAuthClient } from "@/auth/core/oauth/base"

export const authRouter = router({
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.UserTable.findFirst({
        columns: { password: true, salt: true, id: true, email: true, role: true },
        where: eq(UserTable.email, input.email),
      })

      if (user && !user.password) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This account uses Google/GitHub login. Please sign in using your OAuth provider or register a password.",
          })
      }

      if (!user?.password || !user?.salt) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unable to log you in",
        })
      }

      const isCorrectPassword = await comparePasswords({
        hashedPassword: user.password,
        password: input.password,
        salt: user.salt,
      })

      if (!isCorrectPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unable to log you in",
        })
      }

      await createUserSession(user, ctx.cookieStore)
      
      // We return a status or destination url to let the client handle redirection
      return { success: true, redirectTo: "/" }
    }),

  signUp: publicProcedure
  .input(signUpSchema)
  .mutation(async ({ ctx, input }) => {
    // 1. Fetch password/salt fields to check if it's an OAuth account
    const existingUser = await ctx.db.query.UserTable.findFirst({
      columns: { id: true, password: true, salt: true, role: true },
      where: eq(UserTable.email, input.email),
    })

    const salt = generateSalt()
    const hashedPassword = await hashPassword(input.password, salt)
    console.log("existingUser: ",existingUser)
    console.log("338")
    // 2. Scenario A: User exists but has NO password (signed up via OAuth)
    if (existingUser && !existingUser.password) {
      await ctx.db
        .update(UserTable)
        .set({
          password: hashedPassword,
          salt,
          name: input.name, // Optionally update name if blank
        })
        .where(eq(UserTable.id, existingUser.id))

      await createUserSession({ id: existingUser.id, role: existingUser.role }, ctx.cookieStore)
      return { success: true, redirectTo: "/" }
    }

    // 3. Scenario B: User exists AND already has a password set
    if (existingUser && existingUser.password) {
      console.log("existingUser: ",existingUser)
      throw new TRPCError({
        code: "CONFLICT",
        message: "Account already exists for this email*3",
      })
    }

    // 4. Scenario C: Completely new user
    try {
      const [newUser] = await ctx.db
        .insert(UserTable)
        .values({
          name: input.name,
          email: input.email,
          quotaLimit: 100,
          password: hashedPassword,
          salt,
        })
        .returning({ id: UserTable.id, role: UserTable.role })

      if (newUser == null) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to create account",
        })
      }

      await createUserSession(newUser, ctx.cookieStore)
      return { success: true, redirectTo: "/" }
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to create account",
      })
    }
  }),

  logOut: publicProcedure.mutation(async ({ ctx }) => {
    await removeUserFromSession(ctx.cookieStore)
    return { success: true, redirectTo: "/" }
  }),

  oAuthSignIn: publicProcedure
    .input(z.object({ provider: z.enum(["discord", "github"]) })) // Maps to your schema type
    .mutation(async ({ ctx, input }) => {
      const oAuthClient = getOAuthClient(input.provider)
      const authUrl = oAuthClient.createAuthUrl(ctx.cookieStore)
      
      return { url: authUrl }
    }),
})
