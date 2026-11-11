import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

// Shared shell for all protected pages.
export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="container page">
        <Outlet />
      </main>
    </>
  );
}
