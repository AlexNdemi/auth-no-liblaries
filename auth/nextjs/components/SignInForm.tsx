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

export function SignInForm() {
  const [error, setError] = useState<string>()
  const form = useForm({
    resolver:zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof signInSchema>) {
    const error = await signIn(data)
    setError(error)
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {error && <p className="text-destructive">{error}</p>}
      <FieldGroup className="flex gap-4">
        <Button
          type="button"
          onClick={async () => await oAuthSignIn("discord")}
        >
          Discord
        </Button>
        <Button
          type="button"
          onClick={async () => await oAuthSignIn("github")}
        >
          GitHub
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
          <Button type="submit">Sign In</Button>
        </div>
      </FieldGroup>
    </form>
  )
}