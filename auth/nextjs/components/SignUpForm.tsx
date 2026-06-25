"use client"

import { FieldGroup,Field,FieldLabel, FieldError } from "@/components/ui/field"
import { oAuthSignIn, signUp } from "../actions"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { signUpSchema } from "../schemas"
import Link from "next/link"
import { Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

export function SignUpForm() {
  const [error, setError] = useState<string>()
  const form = useForm({
    resolver:zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof signUpSchema>) {
    const error = await signUp(data)
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
          <Button nativeButton={false} render={<Link href="/sign-in">Sign In</Link>} variant="link"></Button>
          <Button type="submit">Sign Up</Button>
        </div>
      </form>
  )
}
