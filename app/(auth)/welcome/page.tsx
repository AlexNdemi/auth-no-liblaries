import { Heading } from "@/web/heading";
import Icons from "@/web/icons";
import LoadingSpinner from "@/web/loading-spinner";

const Page = () => {
  return <div className="flex w-full flex-1 items-center justify-center px-4">
    <Icons.BackgroundPattern className="absolute inset-0 left-1/2 z-0 -translate-x-1/2 opacity-75"/>
    <div className="relative z-10 flex -translate-y-1.5 flex-col items-center gap-6 text-center">
      <LoadingSpinner size={"md"}/>
      <Heading>Creating your account...</Heading>
      <p className="text-base/7 text-gray-600 max-w-prose">
        Just a moment while we set things up for you
      </p>
    </div>
  </div>
}
export default Page;