"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/widget/Navbar";
import Footer from "@/components/widget/Footer";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavAndFooter =
    pathname === "/login" ||
    pathname === "/register";

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
          {children}
      {!hideNavAndFooter && <Footer />}
    </>
  );
}
