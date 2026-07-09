import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "./shared/Navbar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { INTERVIEW_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { AlertTriangle, Mic, MicOff, ShieldCheck, Video, VideoOff } from "lucide-react";

const InterviewSession = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState("permission");
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState(null);
  const [welcomeText, setWelcomeText] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  const SpeechRecognitionApi = useMemo(() => {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);

  const questionLabel = useMemo(() => {
    if (!question || !session) return "Question";
    return `Question ${question.questionNumber}/${session.totalQuestions}`;
  }, [question, session]);

  const stopSpeech = () => {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  const speak = (text) => {
    if (!text || !window.speechSynthesis) return;
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const resetRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      setCameraReady(stream.getVideoTracks().length > 0);
      setMicReady(stream.getAudioTracks().length > 0);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      toast.success("Camera and microphone access granted.");
    } catch (error) {
      toast.error("Camera/Microphone permission is required.");
      console.log(error);
    }
  };

  const sendWarning = async (type) => {
    if (!session?._id) return;
    try {
      const res = await axios.post(
        `${INTERVIEW_API_END_POINT}/session/${session._id}/warning`,
        { type },
        { withCredentials: true }
      );

      if (res.data.success) {
        setSession(res.data.session);
        if (res.data.terminated) {
          setPhase("terminated");
          resetRecognition();
          stopSpeech();
          toast.error("Interview terminated due to suspicious activity.");
        } else {
          toast.warning(`Warning: ${type}. Remaining chances: ${res.data.warning.remaining}`);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNextQuestion = async (sessionId) => {
    const res = await axios.post(
      `${INTERVIEW_API_END_POINT}/session/${sessionId}/next-question`,
      {},
      { withCredentials: true }
    );

    if (res.data.success) {
      setQuestion(res.data.question);
      speak(res.data.question.question);
    }
  };

  const startInterview = async () => {
    try {
      if (!cameraReady || !micReady) {
        toast.error("Allow both camera and microphone before starting.");
        return;
      }

      setIsBusy(true);

      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      const res = await axios.post(
        `${INTERVIEW_API_END_POINT}/start/${applicationId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setSession(res.data.session);
        setQuestion(res.data.session?.pendingQuestion || null);
        setPhase("interview");

        const welcome = `Welcome, ${res.data.welcome.candidateName}. Your ${res.data.welcome.jobTitle} interview is about to begin. This interview has ${res.data.welcome.totalQuestions} questions. Please keep camera and microphone enabled. Good luck.`;
        setWelcomeText(welcome);
        speak(welcome);

        if (!res.data.session?.pendingQuestion) {
          await fetchNextQuestion(res.data.session._id);
        } else {
          speak(res.data.session.pendingQuestion.question);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to start interview.");
    } finally {
      setIsBusy(false);
    }
  };

  const startListening = () => {
    if (!SpeechRecognitionApi) {
      toast.error("Speech Recognition is not supported in this browser.");
      return;
    }

    if (isListening) return;

    const recognition = new SpeechRecognitionApi();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += `${text} `;
        } else {
          interimChunk += text;
        }
      }

      if (finalChunk) {
        setTranscript((prev) => `${prev}${finalChunk}`);
      }
      setInterimTranscript(interimChunk);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const submitAnswer = async () => {
    try {
      const answerToSubmit = `${transcript} ${interimTranscript}`.trim();
      if (!answerToSubmit) {
        toast.error("Please answer before submitting.");
        return;
      }

      setIsBusy(true);
      stopListening();

      const res = await axios.post(
        `${INTERVIEW_API_END_POINT}/session/${session._id}/submit-answer`,
        { answerText: answerToSubmit },
        { withCredentials: true }
      );

      if (res.data.success) {
        setTranscript("");
        setInterimTranscript("");

        if (res.data.completed) {
          toast.success("Interview completed. Generating report...");
          navigate(`/interview/report/${session._id}`);
          return;
        }

        toast.success("Answer evaluated. Next question incoming.");

        const sessionRes = await axios.get(`${INTERVIEW_API_END_POINT}/session/${session._id}`, {
          withCredentials: true,
        });
        if (sessionRes.data.success) {
          setSession(sessionRes.data.session);
        }

        await fetchNextQuestion(session._id);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to submit answer.");
    } finally {
      setIsBusy(false);
    }
  };

  const terminateInterview = async () => {
    if (!session?._id) {
      navigate("/profile");
      return;
    }

    try {
      await axios.post(
        `${INTERVIEW_API_END_POINT}/session/${session._id}/terminate`,
        { reason: "Candidate ended the interview manually." },
        { withCredentials: true }
      );
      toast.warning("Interview ended.");
      navigate("/profile");
    } catch (error) {
      console.log(error);
      toast.error("Failed to terminate interview.");
    }
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (phase === "interview" && document.hidden) {
        sendWarning("tabSwitch");
      }
    };

    const handleFullscreen = () => {
      if (phase === "interview" && !document.fullscreenElement) {
        sendWarning("fullscreenExit");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreen);

    const stream = streamRef.current;
    const videoTrack = stream?.getVideoTracks?.()[0];
    const audioTrack = stream?.getAudioTracks?.()[0];

    if (videoTrack) {
      videoTrack.onended = () => {
        if (phase === "interview") {
          setCameraReady(false);
          sendWarning("cameraOff");
        }
      };
    }

    if (audioTrack) {
      audioTrack.onended = () => {
        if (phase === "interview") {
          setMicReady(false);
          sendWarning("microphoneOff");
        }
      };
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      if (videoTrack) videoTrack.onended = null;
      if (audioTrack) audioTrack.onended = null;
    };
  }, [phase, session]);

  useEffect(() => {
    return () => {
      stopSpeech();
      resetRecognition();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  return (
    <div className='min-h-screen bg-[#06131f] text-white'>
      <Navbar />
      <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,26,38,0.96),rgba(6,20,31,0.96))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:p-8'>
          {phase === "permission" && (
            <>
              <h1 className='text-3xl font-black tracking-tight'>AI Interview Checkpoint</h1>
              <p className='mt-2 text-slate-300'>Enable camera and microphone before starting your adaptive AI interview.</p>

              <div className='mt-6 grid gap-4 sm:grid-cols-2'>
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <h2 className='text-lg font-semibold'>Instructions</h2>
                  <ul className='mt-3 space-y-2 text-sm text-slate-300'>
                    <li>1. Sit in a quiet place and keep your face visible.</li>
                    <li>2. Do not switch tabs or exit fullscreen.</li>
                    <li>3. Do not disable camera or microphone.</li>
                    <li>4. Suspicious activity warnings can terminate the interview.</li>
                  </ul>
                </div>

                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <video ref={videoRef} autoPlay muted playsInline className='h-56 w-full rounded-xl bg-black/40 object-cover' />
                  <div className='mt-3 flex flex-wrap gap-2'>
                    <Badge className={`border ${cameraReady ? "border-emerald-400/40 bg-emerald-500/20" : "border-red-400/40 bg-red-500/20"}`}>
                      {cameraReady ? <Video className='mr-1 h-3 w-3' /> : <VideoOff className='mr-1 h-3 w-3' />} Camera
                    </Badge>
                    <Badge className={`border ${micReady ? "border-emerald-400/40 bg-emerald-500/20" : "border-red-400/40 bg-red-500/20"}`}>
                      {micReady ? <Mic className='mr-1 h-3 w-3' /> : <MicOff className='mr-1 h-3 w-3' />} Microphone
                    </Badge>
                  </div>
                </div>
              </div>

              <div className='mt-6 flex flex-wrap gap-3'>
                <Button onClick={requestPermissions} variant='outline' className='border-white/10 bg-white/5 text-slate-100 hover:bg-white/10'>Allow Camera & Mic</Button>
                <Button disabled={isBusy} onClick={startInterview} className='bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white hover:from-[#fb923c] hover:to-[#f472b6]'>
                  {isBusy ? "Starting..." : "Start AI Interview"}
                </Button>
              </div>
            </>
          )}

          {phase === "interview" && session && question && (
            <>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <p className='text-sm uppercase tracking-[0.3em] text-cyan-300/80'>{session.jobTitle} Interview</p>
                  <h1 className='mt-2 text-2xl font-black'>{questionLabel}</h1>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge className='border border-white/10 bg-white/5 text-cyan-200'>Difficulty: {question.difficulty}</Badge>
                  <Badge className='border border-amber-400/30 bg-amber-500/20 text-amber-200'>Warnings: {session.warnings?.total || 0}</Badge>
                </div>
              </div>

              {welcomeText && (
                <div className='mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm text-cyan-100'>
                  <ShieldCheck className='mr-2 inline h-4 w-4' />
                  {welcomeText}
                </div>
              )}

              <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 p-5'>
                <p className='text-lg font-semibold text-white'>{question.question}</p>
                <p className='mt-3 text-sm text-slate-300'>Use voice to answer. Live transcript updates below.</p>
              </div>

              <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 p-5'>
                <div className='mb-3 flex items-center justify-between'>
                  <h2 className='text-lg font-semibold'>Live Transcript</h2>
                  <Badge className={`border ${isListening ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200" : "border-slate-400/40 bg-slate-500/20 text-slate-200"}`}>
                    {isListening ? "Listening" : "Paused"}
                  </Badge>
                </div>
                <p className='min-h-[110px] whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-200'>
                  {`${transcript}${interimTranscript}`.trim() || "Your spoken answer will appear here..."}
                </p>
              </div>

              <div className='mt-6 flex flex-wrap gap-3'>
                <Button onClick={isListening ? stopListening : startListening} variant='outline' className='border-white/10 bg-white/5 text-slate-100 hover:bg-white/10'>
                  {isListening ? "Pause Mic" : "Start Speaking"}
                </Button>
                <Button disabled={isBusy} onClick={submitAnswer} className='bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white hover:from-[#fb923c] hover:to-[#f472b6]'>
                  {isBusy ? "Evaluating..." : "Submit Answer"}
                </Button>
                <Button onClick={terminateInterview} variant='outline' className='border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20'>
                  End Interview
                </Button>
              </div>

              <p className='mt-4 text-xs text-slate-400'>
                <AlertTriangle className='mr-1 inline h-3 w-3' />
                Do not switch tabs, exit fullscreen, or disable your devices.
              </p>
            </>
          )}

          {phase === "terminated" && (
            <div className='text-center'>
              <h1 className='text-3xl font-black text-red-300'>Interview Terminated</h1>
              <p className='mt-3 text-slate-300'>Multiple suspicious activity warnings were detected.</p>
              <Button className='mt-6 bg-white/10 text-white hover:bg-white/15' onClick={() => navigate("/profile")}>Back to Profile</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
