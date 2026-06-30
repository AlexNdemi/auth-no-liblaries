"use client"

import { Button } from "@/components/ui/button"
import { logOut } from "../actions"

export function LogOutButton() {
  return (
    <Button variant="destructive" className={"h-10"} onClick={async () => await logOut()}>
      Log Out
    </Button>
  )
}
