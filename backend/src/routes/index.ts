import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";
import { coursesRouter } from "../modules/courses/courses.routes.js";
import { enrollmentsRouter } from "../modules/enrollments/enrollments.routes.js";
import { paymentsRouter } from "../modules/payments/payments.routes.js";
import { lessonsRouter } from "../modules/lessons/lessons.routes.js";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { galleryRouter } from "../modules/gallery/gallery.routes.js";
import { libraryRouter } from "../modules/library/library.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Nilsan Educare API is running",
    timestamp: new Date().toISOString()
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/courses", coursesRouter);
apiRouter.use("/enrollments", enrollmentsRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/lessons", lessonsRouter);
apiRouter.use("/gallery", galleryRouter);
apiRouter.use("/library", libraryRouter);
apiRouter.use("/admin", adminRouter);
