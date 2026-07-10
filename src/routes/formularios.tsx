import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminOnly } from "@/components/dashboard/AdminOnly";

export const Route = createFileRoute("/formularios")({
  component: () => (
    <AdminOnly>
      <Outlet />
    </AdminOnly>
  ),
});
