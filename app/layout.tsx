import { Inter } from "next/font/google";
import "../src/app/globals.css";
import SessionProvider from "./components/SessionProvider";
import Navbar from "./components/Navbar";
import { getServerSession } from "next-auth";
import { GET as authOptions } from "./api/auth/[...nextauth]/route";

export const metadata = {
  title: 'SSO Server',
  description: 'Single Sign-On Authentication Server',
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-gray-50 flex flex-col`}>
        <SessionProvider session={session}>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
