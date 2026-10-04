import { ReactNode } from "react";
import Navbar from "@/components/all/Navbar";
import { Footer } from "@/components/all/Footer";
import Splash from "@/components/all/Splash";
import { BackgroundImage } from "@/components/ui/MovingBackground";
import { NextThemeProvider } from "@/providers/themes";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Splash />
      <div className="fixed top-0 left-0 w-full h-full -z-10"></div>
      <BackgroundImage>
        <NextThemeProvider>
          <Navbar/>
          {children}
          <Footer/>
        </NextThemeProvider>
      </BackgroundImage>
    </>
  );
}
