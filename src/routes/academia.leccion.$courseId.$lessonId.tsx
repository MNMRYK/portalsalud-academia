import { createFileRoute } from "@tanstack/react-router";
import { LessonView } from "@/components/dashboard/LessonView";

export const Route = createFileRoute(
  "/academia/leccion/$courseId/$lessonId",
)({
  component: LessonRoute,
});

function LessonRoute() {
  const { courseId, lessonId } = Route.useParams();
  return <LessonView courseId={courseId} lessonId={lessonId} />;
}
