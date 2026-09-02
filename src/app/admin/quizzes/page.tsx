import { Suspense } from "react";
import AdminQuizzesClient from "./quizzes-client";

export default function AdminQuizzesPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-page">
          <p>Loading quizzes...</p>
        </div>
      }
    >
      <AdminQuizzesClient />
    </Suspense>
  );
}
