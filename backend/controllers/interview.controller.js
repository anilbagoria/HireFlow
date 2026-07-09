import { Application } from "../models/application.model.js";
import { InterviewSession } from "../models/interviewSession.model.js";
import { User } from "../models/user.model.js";
import { askGemini } from "../utils/gemini.js";

const MAX_WARNINGS = Number(process.env.INTERVIEW_MAX_WARNINGS || 3);

const clampScore = (value, min = 0, max = 10) => {
  if (typeof value !== "number" || Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
};

const toPercent = (value) => Math.round(clampScore(value) * 10);

const normalizeDifficulty = (difficulty) => {
  if (["easy", "medium", "hard"].includes(difficulty)) {
    return difficulty;
  }
  return "medium";
};

const initialDifficultyFromExperience = (experienceLevel) => {
  if (experienceLevel <= 1) return "easy";
  if (experienceLevel <= 3) return "medium";
  return "hard";
};

const nextDifficulty = (currentDifficulty, scoreOutOfTen) => {
  const current = normalizeDifficulty(currentDifficulty);
  if (scoreOutOfTen >= 8) {
    if (current === "easy") return "medium";
    if (current === "medium") return "hard";
  }
  if (scoreOutOfTen <= 4) {
    if (current === "hard") return "medium";
    if (current === "medium") return "easy";
  }
  return current;
};

const buildQuestionPrompt = ({
  jobTitle,
  requiredSkills,
  experienceLevel,
  difficulty,
  questionNumber,
  totalQuestions,
  previousQuestion,
  previousAnswer,
  previousFeedback,
  previousMissingPoints,
}) => {
  const skillLine = requiredSkills?.length ? requiredSkills.join(", ") : "General interview topics";
  const hasPrevious = Boolean(previousQuestion && previousAnswer);

  return `You are acting as a realistic technical interviewer for a job portal interview session.
Generate exactly ONE interview question.

Job title: ${jobTitle}
Required skills: ${skillLine}
Experience level (years): ${experienceLevel}
Target difficulty: ${difficulty}
Question number: ${questionNumber} of ${totalQuestions}

${
  hasPrevious
    ? `Previous context:
Previous question: ${previousQuestion}
Candidate answer: ${previousAnswer}
Previous feedback summary: ${previousFeedback || "No feedback"}
Missing points from previous answer: ${previousMissingPoints?.join(", ") || "None"}
Use this context to make the interview adaptive and conversational.`
    : "This is the first question."
}

Return ONLY valid JSON with this exact shape:
{
  "question": "string",
  "difficulty": "easy|medium|hard",
  "focusAreas": ["string", "string"],
  "rationale": "short interviewer intent"
}

Rules:
- Keep the question concise and realistic.
- Do not return multiple questions.
- No markdown.
- Ensure difficulty matches target difficulty as closely as possible.`;
};

const buildEvaluationPrompt = ({ question, answerText, jobTitle, difficulty }) => `You are evaluating a spoken interview answer.

Job role: ${jobTitle}
Difficulty: ${difficulty}
Question: ${question}
Candidate answer transcript: ${answerText}

Return ONLY valid JSON with this exact schema:
{
  "score": number,
  "technicalAccuracy": number,
  "communication": number,
  "grammar": number,
  "confidence": number,
  "strengths": ["string"],
  "missingPoints": ["string"],
  "feedback": "string"
}

Scoring rules:
- All numeric scores must be 0 to 10.
- Penalize hallucinated or incorrect claims.
- Consider transcript style because this is spoken communication.
- feedback should be actionable in 1-2 sentences.
- No markdown, no extra keys.`;

const buildFinalReportPrompt = ({
  jobTitle,
  requiredSkills,
  responses,
  aggregate,
}) => `You are generating a final professional interview report.

Role: ${jobTitle}
Skills expected: ${requiredSkills.join(", ")}

Interview responses and feedback summary:
${JSON.stringify(
  responses.map((item) => ({
    questionNumber: item.questionNumber,
    difficulty: item.difficulty,
    question: item.question,
    answerText: item.answerText,
    evaluation: item.evaluation,
  }))
)}

Computed averages (already normalized in percentage):
${JSON.stringify(aggregate)}

Return ONLY valid JSON with this exact schema:
{
  "strongTopics": ["string"],
  "weakTopics": ["string"],
  "recommendedLearningPath": ["string"],
  "hiringRecommendation": "string",
  "summary": "string"
}

Rules:
- Keep recommendations practical and specific.
- Keep hiringRecommendation short and direct.
- summary should sound professional and concise.
- No markdown, no extra keys.`;

const sanitizeEvaluation = (evaluation) => ({
  score: clampScore(evaluation?.score),
  technicalAccuracy: clampScore(evaluation?.technicalAccuracy),
  communication: clampScore(evaluation?.communication),
  grammar: clampScore(evaluation?.grammar),
  confidence: clampScore(evaluation?.confidence),
  strengths: Array.isArray(evaluation?.strengths) ? evaluation.strengths.slice(0, 6) : [],
  missingPoints: Array.isArray(evaluation?.missingPoints) ? evaluation.missingPoints.slice(0, 6) : [],
  feedback: typeof evaluation?.feedback === "string" ? evaluation.feedback : "",
});

const computeAggregateScores = (responses) => {
  if (!responses.length) {
    return {
      overallScore: 0,
      technicalScore: 0,
      communicationScore: 0,
      grammarScore: 0,
      confidenceScore: 0,
    };
  }

  const sums = responses.reduce(
    (acc, item) => {
      acc.score += item.evaluation.score;
      acc.technical += item.evaluation.technicalAccuracy;
      acc.communication += item.evaluation.communication;
      acc.grammar += item.evaluation.grammar;
      acc.confidence += item.evaluation.confidence;
      return acc;
    },
    { score: 0, technical: 0, communication: 0, grammar: 0, confidence: 0 }
  );

  const total = responses.length;
  return {
    overallScore: toPercent(sums.score / total),
    technicalScore: toPercent(sums.technical / total),
    communicationScore: toPercent(sums.communication / total),
    grammarScore: toPercent(sums.grammar / total),
    confidenceScore: toPercent(sums.confidence / total),
  };
};

const generateQuestion = async ({ session, previousResponse }) => {
  const questionNumber = session.responses.length + 1;
  const prompt = buildQuestionPrompt({
    jobTitle: session.jobTitle,
    requiredSkills: session.requiredSkills,
    experienceLevel: session.experienceLevel,
    difficulty: session.currentDifficulty,
    questionNumber,
    totalQuestions: session.totalQuestions,
    previousQuestion: previousResponse?.question,
    previousAnswer: previousResponse?.answerText,
    previousFeedback: previousResponse?.evaluation?.feedback,
    previousMissingPoints: previousResponse?.evaluation?.missingPoints,
  });

  const questionPayload = await askGemini({
    prompt,
    responseMimeType: "application/json",
    temperature: 0.5,
  });

  const question = typeof questionPayload?.question === "string" ? questionPayload.question.trim() : "";
  if (!question) {
    throw new Error("Gemini did not return a valid question.");
  }

  const difficulty = normalizeDifficulty(questionPayload?.difficulty || session.currentDifficulty);

  session.pendingQuestion = {
    questionNumber,
    difficulty,
    question,
    askedAt: new Date(),
  };
  await session.save();

  return session.pendingQuestion;
};

const buildPublicSessionPayload = (session) => ({
  _id: session._id,
  application: session.application,
  job: session.job,
  jobTitle: session.jobTitle,
  requiredSkills: session.requiredSkills,
  totalQuestions: session.totalQuestions,
  status: session.status,
  warnings: session.warnings,
  responsesCount: session.responses.length,
  pendingQuestion: session.pendingQuestion,
  report: session.report,
  terminationReason: session.terminationReason,
  startedAt: session.startedAt,
  endedAt: session.endedAt,
});

export const startInterviewSession = async (req, res) => {
  try {
    const userId = req.id;
    const applicationId = req.params.applicationId;

    const application = await Application.findById(applicationId).populate("job");
    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
        success: false,
      });
    }

    if (String(application.applicant) !== String(userId)) {
      return res.status(403).json({
        message: "Only the applicant can start this interview.",
        success: false,
      });
    }

    if (!application.job) {
      return res.status(404).json({
        message: "Job is not available for this application.",
        success: false,
      });
    }

    const candidate = await User.findById(userId);
    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found.",
        success: false,
      });
    }

    let session = await InterviewSession.findOne({
      application: applicationId,
      candidate: userId,
      status: "in_progress",
    });

    if (!session) {
      const requiredSkills = Array.isArray(application.job.requirements)
        ? application.job.requirements.filter(Boolean)
        : [];

      session = await InterviewSession.create({
        application: applicationId,
        job: application.job._id,
        candidate: userId,
        jobTitle: application.job.title,
        requiredSkills,
        experienceLevel: Number(application.job.experienceLevel || 0),
        currentDifficulty: initialDifficultyFromExperience(Number(application.job.experienceLevel || 0)),
        totalQuestions: 10,
        status: "in_progress",
      });
    }

    if (!session.pendingQuestion && session.responses.length < session.totalQuestions) {
      const previousResponse = session.responses[session.responses.length - 1];
      await generateQuestion({ session, previousResponse });
      await session.populate("candidate", "fullname");
    }

    return res.status(200).json({
      success: true,
      message: "Interview session is ready.",
      session: buildPublicSessionPayload(session),
      welcome: {
        candidateName: candidate.fullname,
        jobTitle: session.jobTitle,
        totalQuestions: session.totalQuestions,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to start interview session.",
      success: false,
    });
  }
};

export const getInterviewSession = async (req, res) => {
  try {
    const userId = req.id;
    const sessionId = req.params.sessionId;

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Interview session not found.", success: false });
    }

    if (String(session.candidate) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized interview access.", success: false });
    }

    return res.status(200).json({
      success: true,
      session: buildPublicSessionPayload(session),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch interview session.",
      success: false,
    });
  }
};

export const generateNextQuestion = async (req, res) => {
  try {
    const userId = req.id;
    const sessionId = req.params.sessionId;

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Interview session not found.", success: false });
    }
    if (String(session.candidate) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized interview access.", success: false });
    }

    if (session.status !== "in_progress") {
      return res.status(400).json({
        message: `Interview session is ${session.status}.`,
        success: false,
      });
    }

    if (session.responses.length >= session.totalQuestions) {
      return res.status(400).json({
        message: "Interview is already complete.",
        success: false,
      });
    }

    if (!session.pendingQuestion) {
      const previousResponse = session.responses[session.responses.length - 1];
      await generateQuestion({ session, previousResponse });
    }

    return res.status(200).json({
      success: true,
      question: session.pendingQuestion,
      progress: {
        answered: session.responses.length,
        total: session.totalQuestions,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to generate next question.",
      success: false,
    });
  }
};

const finalizeInterviewReport = async (session) => {
  const aggregateScores = computeAggregateScores(session.responses);

  const reportPrompt = buildFinalReportPrompt({
    jobTitle: session.jobTitle,
    requiredSkills: session.requiredSkills,
    responses: session.responses,
    aggregate: aggregateScores,
  });

  let aiReport = {
    strongTopics: [],
    weakTopics: [],
    recommendedLearningPath: [],
    hiringRecommendation: "Needs further evaluation.",
    summary: "Interview completed.",
  };

  try {
    aiReport = await askGemini({
      prompt: reportPrompt,
      responseMimeType: "application/json",
      temperature: 0.3,
    });
  } catch (error) {
    console.log("Final report AI generation failed:", error.message);
  }

  session.report = {
    ...aggregateScores,
    strongTopics: Array.isArray(aiReport?.strongTopics) ? aiReport.strongTopics.slice(0, 8) : [],
    weakTopics: Array.isArray(aiReport?.weakTopics) ? aiReport.weakTopics.slice(0, 8) : [],
    recommendedLearningPath: Array.isArray(aiReport?.recommendedLearningPath)
      ? aiReport.recommendedLearningPath.slice(0, 8)
      : [],
    hiringRecommendation:
      typeof aiReport?.hiringRecommendation === "string"
        ? aiReport.hiringRecommendation
        : "Needs further evaluation.",
    summary: typeof aiReport?.summary === "string" ? aiReport.summary : "Interview completed.",
  };

  session.status = "completed";
  session.pendingQuestion = null;
  session.endedAt = new Date();
  await session.save();
};

export const submitInterviewAnswer = async (req, res) => {
  try {
    const userId = req.id;
    const sessionId = req.params.sessionId;
    const { answerText } = req.body;

    if (!answerText || !answerText.trim()) {
      return res.status(400).json({
        message: "Answer text is required.",
        success: false,
      });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Interview session not found.", success: false });
    }
    if (String(session.candidate) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized interview access.", success: false });
    }
    if (session.status !== "in_progress") {
      return res.status(400).json({
        message: `Interview session is ${session.status}.`,
        success: false,
      });
    }

    if (!session.pendingQuestion?.question) {
      return res.status(400).json({
        message: "No active question to answer.",
        success: false,
      });
    }

    const evaluationPrompt = buildEvaluationPrompt({
      question: session.pendingQuestion.question,
      answerText: answerText.trim(),
      jobTitle: session.jobTitle,
      difficulty: session.pendingQuestion.difficulty,
    });

    let evaluation = await askGemini({
      prompt: evaluationPrompt,
      responseMimeType: "application/json",
      temperature: 0.2,
    });
    evaluation = sanitizeEvaluation(evaluation);

    session.responses.push({
      questionNumber: session.pendingQuestion.questionNumber,
      difficulty: session.pendingQuestion.difficulty,
      question: session.pendingQuestion.question,
      answerText: answerText.trim(),
      evaluation,
      answeredAt: new Date(),
    });

    session.currentDifficulty = nextDifficulty(session.pendingQuestion.difficulty, evaluation.score);
    session.pendingQuestion = null;

    if (session.responses.length >= session.totalQuestions) {
      await finalizeInterviewReport(session);
      return res.status(200).json({
        success: true,
        completed: true,
        message: "Interview completed successfully.",
        report: session.report,
        session: buildPublicSessionPayload(session),
      });
    }

    await session.save();

    return res.status(200).json({
      success: true,
      completed: false,
      message: "Answer evaluated successfully.",
      evaluation,
      progress: {
        answered: session.responses.length,
        total: session.totalQuestions,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to submit answer.",
      success: false,
    });
  }
};

export const registerInterviewWarning = async (req, res) => {
  try {
    const userId = req.id;
    const sessionId = req.params.sessionId;
    const { type } = req.body;

    const supportedTypes = ["tabSwitch", "fullscreenExit", "cameraOff", "microphoneOff"];
    if (!supportedTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid warning type.",
        success: false,
      });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Interview session not found.", success: false });
    }
    if (String(session.candidate) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized interview access.", success: false });
    }
    if (session.status !== "in_progress") {
      return res.status(400).json({ message: `Interview session is ${session.status}.`, success: false });
    }

    session.warnings[type] += 1;
    session.warnings.total += 1;

    let terminated = false;
    if (session.warnings.total >= MAX_WARNINGS) {
      session.status = "terminated";
      session.terminationReason = "Interview terminated due to suspicious activity warnings.";
      session.pendingQuestion = null;
      session.endedAt = new Date();
      terminated = true;
    }

    await session.save();

    return res.status(200).json({
      success: true,
      terminated,
      warning: {
        total: session.warnings.total,
        remaining: Math.max(0, MAX_WARNINGS - session.warnings.total),
        type,
      },
      message: terminated
        ? "Interview terminated due to multiple warnings."
        : `Warning recorded for ${type}.`,
      session: buildPublicSessionPayload(session),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to record interview warning.",
      success: false,
    });
  }
};

export const terminateInterviewSession = async (req, res) => {
  try {
    const userId = req.id;
    const sessionId = req.params.sessionId;
    const { reason } = req.body;

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Interview session not found.", success: false });
    }
    if (String(session.candidate) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized interview access.", success: false });
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Completed interview cannot be terminated.", success: false });
    }

    session.status = "terminated";
    session.pendingQuestion = null;
    session.terminationReason = reason || "Interview terminated by candidate.";
    session.endedAt = new Date();
    await session.save();

    return res.status(200).json({
      success: true,
      message: "Interview terminated.",
      session: buildPublicSessionPayload(session),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to terminate interview session.",
      success: false,
    });
  }
};
