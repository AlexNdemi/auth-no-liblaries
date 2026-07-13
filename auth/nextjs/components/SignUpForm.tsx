"use client"

import { FieldGroup,Field,FieldLabel, FieldError } from "@/components/ui/field"
import { oAuthSignIn} from "../actions"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { signUpSchema } from "../schemas"
import Link from "next/link"
import { Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTRPC } from "@/lib/trpc"
import { useMutation } from "@tanstack/react-query"

export function SignUpForm() {
  const [error, setError] = useState<string>()
  const router = useRouter()
  const trpc = useTRPC()
  
  const form = useForm({
    resolver:zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const signUpMutation = useMutation({
    ...trpc.auth.signUp.mutationOptions(),
    onSuccess: (data) => {
  
      router.push(data.redirectTo)
      router.refresh()
    },
    onError: (err) => {
      
      setError(err.message)
    },
  })
  const oauthMutation = useMutation({
    ...trpc.auth.oAuthSignIn.mutationOptions(),
    onSuccess:(data) => {
      window.location.href =data.url
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  async function onSubmit(data: z.infer<typeof signUpSchema>) {
    setError(undefined)
    signUpMutation.mutate(data)
  }

  const isPending = signUpMutation.isPending || oauthMutation.isPending

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

      </FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({field,fieldState})=>(
            <Field>
              <FieldLabel>name</FieldLabel>
              <Input
                aria-invalid={fieldState.invalid}  
                placeholder="John Doe"
                disabled={isPending} 
                {...field}/>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]}/>
              )}
            </Field>
          )}
        />
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
          <Button nativeButton={false} render={<Link href="/sign-in">Sign In</Link>} variant="link"></Button>
          <Button type="submit" disabled={isPending}>
            {signUpMutation.isPending ? "Signing Up..." : "Sign Up"}
          </Button>
        </div>
      </form>
  )
}
