"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { adminCourses, adminQuizzes } from "@/data/admin";

type QuizItem = (typeof adminQuizzes)[number];

type QuestionDraft = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: "A" | "B" | "C" | "D";
};

const emptyQuestion = (): QuestionDraft => ({
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  answer: "A"
});

export default function AdminQuizzesClient() {
  const searchParams = useSearchParams();
  const presetCourse = searchParams.get("course") ?? adminCourses[0]?.id ?? "";

  const [quizzes, setQuizzes] = useState<QuizItem[]>(adminQuizzes);
  const [showForm, setShowForm] = useState(Boolean(searchParams.get("course")));
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState(presetCourse);
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [message, setMessage] = useState("");

  const courseName = useMemo(
    () => adminCourses.find((course) => course.id === courseId)?.title ?? "Course",
    [courseId]
  );

  function updateQuestion(index: number, patch: Partial<QuestionDraft>) {
    setQuestions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a quiz title.");
      return;
    }

    const validQuestions = questions.filter((q) => q.question.trim());
    if (validQuestions.length === 0) {
      setMessage("Add at least one question.");
      return;
    }

    const newQuiz: QuizItem = {
      id: `quiz-${Date.now()}`,
      title: title.trim(),
      courseId,
      course: courseName,
      questions: validQuestions.length,
      attempts: 0,
      avgScore: 0,
      status: "Draft"
    };

    setQuizzes((prev) => [newQuiz, ...prev]);
    setTitle("");
    setQuestions([emptyQuestion()]);
    setShowForm(false);
    setMessage(`Quiz "${newQuiz.title}" added to ${courseName}.`);
  }

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Quizzes</p>
          <h1>Tests & Quizzes</h1>
          <p>Create simple quizzes and attach them to any course.</p>
        </div>
        <button
          className="admin-primary-action"
          onClick={() => {
            setShowForm((value) => !value);
            setMessage("");
          }}
          type="button"
        >
          <Plus size={18} />
          {showForm ? "Close form" : "Create Quiz"}
        </button>
      </div>

      {message ? <p className="admin-flash">{message}</p> : null}

      {showForm ? (
        <form className="admin-form" onSubmit={handleCreate}>
          <div className="admin-form__row">
            <label>
              Quiz title
              <input
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Week 2 Vocabulary Check"
                type="text"
                value={title}
              />
            </label>
            <label>
              Course
              <select
                onChange={(event) => setCourseId(event.target.value)}
                value={courseId}
              >
                {adminCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {questions.map((item, index) => (
            <div className="admin-question" key={index}>
              <strong>Question {index + 1}</strong>
              <input
                onChange={(event) =>
                  updateQuestion(index, { question: event.target.value })
                }
                placeholder="Write the question"
                type="text"
                value={item.question}
              />
              <div className="admin-form__options">
                {(["A", "B", "C", "D"] as const).map((key) => (
                  <input
                    key={key}
                    onChange={(event) =>
                      updateQuestion(index, {
                        [`option${key}`]: event.target.value
                      } as Partial<QuestionDraft>)
                    }
                    placeholder={`Option ${key}`}
                    type="text"
                    value={item[`option${key}`]}
                  />
                ))}
              </div>
              <label className="admin-inline-label">
                Correct answer
                <select
                  onChange={(event) =>
                    updateQuestion(index, {
                      answer: event.target.value as QuestionDraft["answer"]
                    })
                  }
                  value={item.answer}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </label>
            </div>
          ))}

          <div className="admin-form__actions">
            <button
              className="admin-secondary-action"
              onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
              type="button"
            >
              Add another question
            </button>
            <button className="admin-primary-action" type="submit">
              Save quiz
            </button>
          </div>
        </form>
      ) : null}

      <div className="admin-table admin-table--quizzes" role="table" aria-label="Quizzes">
        <div className="admin-table__head" role="row">
          <span>Quiz</span>
          <span>Course</span>
          <span>Questions</span>
          <span>Attempts</span>
          <span>Avg score</span>
          <span>Status</span>
        </div>
        {quizzes.map((quiz) => (
          <div className="admin-table__row" role="row" key={quiz.id}>
            <span>
              <strong>{quiz.title}</strong>
            </span>
            <span>{quiz.course}</span>
            <span>{quiz.questions}</span>
            <span>{quiz.attempts}</span>
            <span>{quiz.avgScore}%</span>
            <span className={`admin-status admin-status--${quiz.status.toLowerCase()}`}>
              {quiz.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
