import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case 'OAuthSignin':
      case 'OAuthCallback':
        return 'Could not authenticate with Google. Please check your credentials or try again.';
      case 'OAuthCreateAccount':
        return 'Could not create account with Google. Please try again or use email sign up.';
      case 'EmailCreateAccount':
        return 'Could not create account with this email.';
      case 'Callback':
        return 'Authentication callback failed. Please retry.';
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another login method. Please sign in with your email/password.';
      case 'AccessDenied':
        return 'Access was denied. Please ensure you have granted necessary permissions.';
      case 'Configuration':
        return 'There was a configuration issue with authentication.';
      default:
        return errorCode || 'An unexpected error occurred during authentication.';
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-surface">
      <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 shadow-lg text-center">
        <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center text-error">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-headline font-bold text-on-surface mb-2">
          Authentication Issue
        </h1>

        <p className="text-sm font-body text-secondary mb-6 leading-relaxed">
          {getErrorMessage(error)}
        </p>

        {error && (
          <div className="mb-6 p-2.5 rounded bg-surface-container-low text-[11px] font-mono text-secondary/80 break-all">
            Code: {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/signin"
            className="w-full py-3.5 px-6 rounded-xl bg-primary text-on-primary font-label font-medium hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>

          <Link
            href="/"
            className="w-full py-3 px-6 rounded-xl border border-outline-variant/40 text-on-surface font-label font-medium hover:bg-surface-container transition-all"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
