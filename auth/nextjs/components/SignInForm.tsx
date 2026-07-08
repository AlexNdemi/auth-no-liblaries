"use client"

import { oAuthSignIn, signIn } from "../actions"
import { useForm } from "react-hook-form"
import {  z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { signInSchema } from "../schemas"
import Link from "next/link"
import {zodResolver} from "@hookform/resolvers/zod"
import { FieldGroup,Field,FieldLabel, FieldError } from "@/components/ui/field"
import { Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useTRPC } from "@/lib/trpc"
import { useMutation } from "@tanstack/react-query"

export function SignInForm() {
  const router = useRouter()
  const trpc = useTRPC()
  const [error, setError] = useState<string>()

  const form = useForm({
    resolver:zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const signInMutation = useMutation({
    ...trpc.auth.signIn.mutationOptions(),
    onSuccess: (data) => {
      // Handles client-side navigation following successful cookie creation
      router.push(data.redirectTo)
      router.refresh()
    },
    onError: (err) => {
      // Automatically captures messages thrown from your server's TRPCError
      setError(err.message)
    },
  })

  const oauthMutation = useMutation({
    ...trpc.auth.oAuthSignIn.mutationOptions(),
    onSuccess: (data) => {
      // 'data' is strongly typed as { url: string }
      window.location.href = data.url
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  async function onSubmit(data: z.infer<typeof signInSchema>) {
    setError(undefined)
    signInMutation.mutate(data)
  }

  const isPending = signInMutation.isPending || oauthMutation.isPending
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {error && <p className="text-destructive">{error}</p>}
      <FieldGroup className="flex gap-4">
        <Button
          type="button"
          disabled={isPending}
          onClick={async () => await oAuthSignIn("discord")}
        >
          {oauthMutation.isPending ? "Connecting..." : "Discord"}
        </Button>
        <Button
          type="button"
          disabled={isPending}
          onClick={async () => await oAuthSignIn("github")}
        >
          {oauthMutation.isPending ? "Connecting..." : "GitHub"}
        </Button>
      </FieldGroup>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({field,fieldState})=>(
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                aria-invalid={fieldState.invalid}  
                placeholder="Johndoe@gmail.com"
                disabled={isPending} 
                {...field}/>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]}/>
              )}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({field,fieldState})=>(
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input
                aria-invalid={fieldState.invalid} 
                placeholder="******"
                disabled={isPending} 
                {...field} 
                type="password"/>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]}/>
              )}
            </Field>
          )}
        />
        <div className="flex gap-4 justify-end">
          <Button nativeButton={false} render={<Link href="/sign-up">Sign Up</Link>} variant="link">
            
          </Button>
          <Button type="submit" disabled={isPending}>
            {signInMutation.isPending ? "Signing In..." : "Sign In"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}