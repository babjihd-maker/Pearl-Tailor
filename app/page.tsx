import { redirect } from 'next/navigation';

export default function Home() {
  // This sends you instantly to the real Login Page
  redirect('/login');
}