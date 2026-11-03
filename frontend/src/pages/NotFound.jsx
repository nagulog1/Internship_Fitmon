import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { Logo } from '../components/ui';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-canvas px-4 py-8 text-ink sm:px-8">
      <Logo className="self-start" />
      <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col justify-center py-16">
        <p className="caption-3 font-mono text-volt-deep">404</p>
        <h1 className="heading-3 sm:heading-2 mt-4 text-gradient-hero">This rep is off the record</h1>
        <p className="body-7 mt-6 text-ink-2">The page you followed does not exist on FitMon. It may have moved, or the link has a typo.</p>
        <Link to="/" className="button button-primary mt-8 self-start">
          <ArrowLeftIcon className="size-4" weight="bold" aria-hidden />
          Back to the homepage
        </Link>
      </div>
    </main>
  );
}
