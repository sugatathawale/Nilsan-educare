export const adminMetrics = [
  {
    label: "Total Students",
    value: "1,248",
    delta: "+12.4%",
    detail: "84 new this month",
    icon: "Users"
  },
  {
    label: "Active Courses",
    value: "18",
    delta: "+3",
    detail: "6 beginner, 8 intermediate, 4 advanced",
    icon: "BookOpen"
  },
  {
    label: "Quizzes",
    value: "36",
    delta: "+5",
    detail: "4 quizzes need review",
    icon: "ClipboardList"
  },
  {
    label: "Avg. Score",
    value: "78%",
    delta: "+4.2%",
    detail: "Across all quiz attempts",
    icon: "BarChart3"
  }
];

export const adminCourses = [
  {
    id: "spoken-english-basic",
    title: "Spoken English Basic",
    students: 428,
    trainer: "Priya Sharma",
    status: "Active",
    completion: 65,
    quizzes: 4
  },
  {
    id: "english-grammar",
    title: "English Grammar",
    students: 312,
    trainer: "Rajesh Kumar",
    status: "Active",
    completion: 52,
    quizzes: 6
  },
  {
    id: "business-communication",
    title: "Business Communication",
    students: 268,
    trainer: "Anjali Verma",
    status: "Review",
    completion: 78,
    quizzes: 3
  },
  {
    id: "ielts-speaking-lab",
    title: "IELTS Speaking Lab",
    students: 156,
    trainer: "Dr. Arjun Singh",
    status: "Draft",
    completion: 34,
    quizzes: 2
  }
];

export const adminStudents = [
  {
    id: "stu-1",
    name: "Aman Patel",
    email: "aman.patel@email.com",
    course: "Spoken English Basic",
    progress: 72,
    lastActive: "Today",
    score: 84
  },
  {
    id: "stu-2",
    name: "Neha Gupta",
    email: "neha.gupta@email.com",
    course: "Business Communication",
    progress: 58,
    lastActive: "Yesterday",
    score: 76
  },
  {
    id: "stu-3",
    name: "Rohan Verma",
    email: "rohan.verma@email.com",
    course: "English Grammar",
    progress: 41,
    lastActive: "2 days ago",
    score: 68
  },
  {
    id: "stu-4",
    name: "Divya Sharma",
    email: "divya.sharma@email.com",
    course: "IELTS Speaking Lab",
    progress: 89,
    lastActive: "Today",
    score: 91
  },
  {
    id: "stu-5",
    name: "Kabir Mehta",
    email: "kabir.mehta@email.com",
    course: "Spoken English Basic",
    progress: 33,
    lastActive: "5 days ago",
    score: 55
  },
  {
    id: "stu-6",
    name: "Sneha Iyer",
    email: "sneha.iyer@email.com",
    course: "English Grammar",
    progress: 67,
    lastActive: "Yesterday",
    score: 82
  }
];

export const adminQuizzes = [
  {
    id: "quiz-1",
    title: "Greetings & Introductions",
    courseId: "spoken-english-basic",
    course: "Spoken English Basic",
    questions: 10,
    attempts: 312,
    avgScore: 81,
    status: "Published"
  },
  {
    id: "quiz-2",
    title: "Tenses Checkpoint",
    courseId: "english-grammar",
    course: "English Grammar",
    questions: 15,
    attempts: 248,
    avgScore: 74,
    status: "Published"
  },
  {
    id: "quiz-3",
    title: "Email Writing Basics",
    courseId: "business-communication",
    course: "Business Communication",
    questions: 8,
    attempts: 156,
    avgScore: 79,
    status: "Draft"
  },
  {
    id: "quiz-4",
    title: "IELTS Part 1 Warm-up",
    courseId: "ielts-speaking-lab",
    course: "IELTS Speaking Lab",
    questions: 12,
    attempts: 98,
    avgScore: 86,
    status: "Published"
  }
];

export const studentAnalytics = [
  { label: "Active this week", value: "642", note: "+48 vs last week" },
  { label: "Quiz completions", value: "1,104", note: "Last 30 days" },
  { label: "Avg. attendance", value: "86%", note: "Across live classes" },
  { label: "At-risk students", value: "37", note: "Progress under 40%" }
];

export const coursePerformance = [
  { course: "Spoken English Basic", enrollment: 428, avgScore: 81, completion: 65 },
  { course: "English Grammar", enrollment: 312, avgScore: 74, completion: 52 },
  { course: "Business Communication", enrollment: 268, avgScore: 79, completion: 78 },
  { course: "IELTS Speaking Lab", enrollment: 156, avgScore: 86, completion: 34 }
];

export const recentEnrollments = [
  {
    student: "Aman Patel",
    course: "Spoken English Basic",
    amount: "₹1,799",
    status: "Paid"
  },
  {
    student: "Neha Gupta",
    course: "Business Communication",
    amount: "₹3,499",
    status: "Paid"
  },
  {
    student: "Rohan Verma",
    course: "English Grammar",
    amount: "₹2,199",
    status: "Pending"
  },
  {
    student: "Divya Sharma",
    course: "IELTS Speaking Lab",
    amount: "₹4,999",
    status: "Paid"
  }
];

export const adminTasks = [
  "Review 4 draft quizzes before publishing",
  "Follow up with 37 at-risk students",
  "Confirm tomorrow's Grammar live batch",
  "Add Week 3 quiz to Spoken English Basic"
];
