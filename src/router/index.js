import { createRouter, createWebHistory } from "vue-router";

// Student pages
import StudentLogin from "@/views/student/StudentLogin.vue";
import Instructions from "@/views/student/Instructions.vue";
import TakeTest from "@/views/student/TakeTest.vue";
import Summary from "@/views/student/Summary.vue";

// Admin pages
import AdminLogin from "@/views/admin/AdminLogin.vue";
import AdminDashboard from "@/views/admin/AdminDashboard.vue";
import AdminResults from "@/views/admin/AdminResults.vue";
import UploadData from "@/views/admin/UploadData.vue";

import TestHome from "@/views/TestHome.vue";

const routes = [
  // ---- Student Flow ----
  {
    path: "/:clientId/:testId",
    name: "test-home",
    component: TestHome,
  },
  {
    path: "/test/student-login",
    name: "student-login",
    component: StudentLogin,
  },
  {
    path: "/test/instructions",
    name: "instructions",
    component: Instructions,
  },
  {
    path: "/test/take-test",
    name: "take-test",
    component: TakeTest,
  },
  {
    path: "/client/:clientId/test/:testId/summary",
    name: "summary",
    component: Summary,
  },

  // ---- Admin Flow ----
  {
    path: "/admin-login",
    name: "admin-login",
    component: AdminLogin,
  },
  {
    path: "/admin/:clientId/dashboard",
    name: "admin-dashboard",
    component: AdminDashboard,
  },
  {
    path: "/admin/:clientId/test/:testId/results",
    name: "admin-results",
    component: AdminResults,
  },
  {
    path: "/admin/:clientId/test/:testId/upload",
    name: "upload-data",
    component: UploadData,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;