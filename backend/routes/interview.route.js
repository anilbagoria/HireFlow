import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  generateNextQuestion,
  getInterviewSession,
  registerInterviewWarning,
  startInterviewSession,
  submitInterviewAnswer,
  terminateInterviewSession,
} from "../controllers/interview.controller.js";

const router = express.Router();

router.route("/start/:applicationId").post(isAuthenticated, startInterviewSession);
router.route("/session/:sessionId").get(isAuthenticated, getInterviewSession);
router.route("/session/:sessionId/next-question").post(isAuthenticated, generateNextQuestion);
router.route("/session/:sessionId/submit-answer").post(isAuthenticated, submitInterviewAnswer);
router.route("/session/:sessionId/warning").post(isAuthenticated, registerInterviewWarning);
router.route("/session/:sessionId/terminate").post(isAuthenticated, terminateInterviewSession);

export default router;
