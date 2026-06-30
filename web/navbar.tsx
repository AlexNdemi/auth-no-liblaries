import Link from "next/link";
import { MaxWidthWrapper } from "./max-width-wrapper";
import { getCurrentUser } from "@/auth/nextjs/currentUser"
import { LogOutButton } from "@/auth/nextjs/components/LogOutButton";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
const Navbar=async ()=>{
  const fullUser = await getCurrentUser({ withFullUser: true })
  return <nav className="sticky z-[100] h-16 inset-x-0 top-0 w-full border-b border-gray-200  bg-white/80 backdrop-blur-lg transition-all">
    <MaxWidthWrapper>
      <div className="flex h-16 items-center justify-between">
        <Link href={"/"} className="flex z-40 font-semibold">
          Ping<span className="text-brand-700">Panda</span>
        </Link>
        <div className="h-full flex items-center space-x-4">
          {fullUser?<>
            <Link 
              href="/dashboard"
              className={buttonVariants({
                size:"sm",
                className:" sm:flex items-center gap h-10"
                })}>Dashboard<ArrowRight className="ml-1.5 size-4"/>
            </Link>
            <LogOutButton/>
          </>:(
            <>
              <Link 
              href="/dashboard"
              className={buttonVariants({
                size:"sm",
                variant:"ghost",
                className:"hidden sm:inline-flex h-10"
                })}>Pricing
              </Link>
              <Link 
              href="/sign-in"
              className={buttonVariants({
                size:"sm",
                variant:"ghost",
                className:"h-10"
                })}>Sign in
              </Link>
              <div className="h-8 w-px bg-gray-200"/>
              <Link 
              href="/sign-up"
              className={buttonVariants({
                size:"sm",
                className:"h-10 flex items-center gap-1.5"
                })}>Sign up<ArrowRight className="size-4"/>
              </Link>
            </>
            
          )}
        </div>
      </div>
    </MaxWidthWrapper>
  </nav>
}
export default Navbar;