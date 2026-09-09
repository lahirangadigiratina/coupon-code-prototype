import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "./AppHeader";

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen overflow-x-clip bg-neutral-50">
      <AppHeader />
      <main className="mx-auto w-full min-w-0 max-w-content px-6 py-8">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}
