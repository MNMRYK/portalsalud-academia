import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/academia")({
  component: () => <Outlet />,
});
