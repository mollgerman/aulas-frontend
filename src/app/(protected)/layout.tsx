import Navbar from "@/components/Navbar";
import { getServerUserNameCookie } from "@/lib/actions/login.action";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aulas",
  description: "Where the learning begins!",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userName = await getServerUserNameCookie();

  return (
    <main className="bg-neutral-100">
      <Navbar serverUserName={userName} />
      {children}
    </main>
  );
}
