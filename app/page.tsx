import { redirect } from 'next/navigation';

export default function Home() {
  // Instead of showing the "System Check" text, 
  // this instantly sends the user to your beautiful Login page
  redirect('/login');
}