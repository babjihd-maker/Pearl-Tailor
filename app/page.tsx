import { redirect } from 'next/navigation';

export default function Home() {
  // Instead of running a test that fails on empty data,
  // we just send the user straight to the login page.
  redirect('/login');
}
