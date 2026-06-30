import { LogOutButton } from "@/auth/nextjs/components/LogOutButton"
import { getCurrentUser } from "@/auth/nextjs/currentUser"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

export default async function HomePage() {
  const fullUser = await getCurrentUser({ withFullUser: true })
  console.log("fullUser:",fullUser)

  return (
    <div className="container mx-auto p-4">
      {fullUser == null ? (
        <div className="flex gap-4">
          <Button nativeButton={false} render={<Link href="/sign-in">Sign In</Link>}>
            
          </Button>
          <Button nativeButton={false} render={<Link href="/sign-up">Sign Up</Link>}>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>
      ) : (
        <Card className="max-w-[500px] mt-4">
          <CardHeader>
            <CardTitle>User: {fullUser.name}</CardTitle>
            <CardDescription>Role: {fullUser.role}</CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-4">
            <Button nativeButton={false} render={ <Link href="/private">Private Page</Link>} variant="outline">
             
            </Button>
            {fullUser.role === "admin" && (
              <Button nativeButton={false} render={<Link href="/admin">Admin Page</Link>} variant="outline">
                
              </Button>
            )}
            <LogOutButton />
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
