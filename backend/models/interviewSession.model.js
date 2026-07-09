import mongoose from "mongoose";

const interviewEvaluationSchema = new mongoose.Schema(
  {
    score: { type: Number, min: 0, max: 10, default: 0 },
    technicalAccuracy: { type: Number, min: 0, max: 10, default: 0 },
    communication: { type: Number, min: 0, max: 10, default: 0 },
    grammar: { type: Number, min: 0, max: 10, default: 0 },
    confidence: { type: Number, min: 0, max: 10, default: 0 },
    strengths: [{ type: String }],
    missingPoints: [{ type: String }],
    feedback: { type: String, default: "" },
  },
  { _id: false }
);

const interviewResponseSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    question: { type: String, required: true },
    answerText: { type: String, required: true },
    evaluation: { type: interviewEvaluationSchema, required: true },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const warningSchema = new mongoose.Schema(
  {
    total: { type: Number, default: 0 },
    tabSwitch: { type: Number, default: 0 },
    fullscreenExit: { type: Number, default: 0 },
    cameraOff: { type: Number, default: 0 },
    microphoneOff: { type: Number, default: 0 },
  },
  { _id: false }
);

const pendingQuestionSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number },
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    question: { type: String },
    askedAt: { type: Date },
  },
  { _id: false }
);

const aggregateReportSchema = new mongoose.Schema(
  {
    overallScore: { type: Number, min: 0, max: 100, default: 0 },
    technicalScore: { type: Number, min: 0, max: 100, default: 0 },
    communicationScore: { type: Number, min: 0, max: 100, default: 0 },
    grammarScore: { type: Number, min: 0, max: 100, default: 0 },
    confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
    strongTopics: [{ type: String }],
    weakTopics: [{ type: String }],
    recommendedLearningPath: [{ type: String }],
    hiringRecommendation: { type: String, default: "" },
    summary: { type: String, default: "" },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobTitle: { type: String, required: true },
    requiredSkills: [{ type: String }],
    experienceLevel: { type: Number, default: 0 },
    currentDifficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    totalQuestions: { type: Number, default: 10 },
    status: {
      type: String,
      enum: ["in_progress", "completed", "terminated"],
      default: "in_progress",
      index: true,
    },
    warnings: { type: warningSchema, default: () => ({}) },
    pendingQuestion: { type: pendingQuestionSchema, default: null },
    responses: { type: [interviewResponseSchema], default: [] },
    report: { type: aggregateReportSchema, default: () => ({}) },
    terminationReason: { type: String, default: "" },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

interviewSessionSchema.index({ application: 1, candidate: 1, status: 1 });

export const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);
