import { Suspense } from "react";
import AdminLessonsClient from "./lessons-client";

export default function AdminLessonsPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-page">
          <p className="admin-state">Loading lessons...</p>
        </div>
      }
    >
      <AdminLessonsClient />
    </Suspense>
  );
}
