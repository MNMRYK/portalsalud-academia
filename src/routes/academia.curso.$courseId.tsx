import { createFileRoute } from "@tanstack/react-router";
import { CourseDetail } from "@/components/dashboard/CourseDetail";

export const Route = createFileRoute("/academia/curso/$courseId")({
  component: CourseDetailRoute,
});

function CourseDetailRoute() {
  const { courseId } = Route.useParams();
  return <CourseDetail courseId={courseId} />;
}
