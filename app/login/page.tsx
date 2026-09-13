import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <div className="container-page flex max-w-sm flex-col items-center py-24 text-center">
      <h1 className="text-2xl font-bold text-zinc-900">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Sign in to track your orders and check out faster.
      </p>
      <div className="mt-8 w-full">
        <GoogleSignInButton redirectTo={searchParams.next} />
      </div>
    </div>
  );
}
