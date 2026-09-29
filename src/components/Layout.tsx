import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      <main key={pathname} className="flex-1 min-w-0 pt-16 animate-fade-in">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
