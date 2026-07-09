import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { INTERVIEW_API_END_POINT } from "@/utils/constant";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

const InterviewReport = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${INTERVIEW_API_END_POINT}/session/${sessionId}`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setSession(res.data.session);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Failed to load interview report.");
      }
    };

    fetchReport();
  }, [sessionId]);

  if (!session) {
    return (
      <div className='min-h-screen bg-[#06131f] text-white'>
        <Navbar />
        <div className='mx-auto max-w-4xl px-4 py-10'>Loading interview report...</div>
      </div>
    );
  }

  const report = session.report || {};

  const scoreCards = [
    { label: "Overall", value: report.overallScore },
    { label: "Technical", value: report.technicalScore },
    { label: "Communication", value: report.communicationScore },
    { label: "Confidence", value: report.confidenceScore },
    { label: "Grammar", value: report.grammarScore },
  ];

  return (
    <div className='min-h-screen bg-[#06131f] text-white'>
      <Navbar />
      <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,26,38,0.96),rgba(6,20,31,0.96))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:p-8'>
          <p className='text-sm uppercase tracking-[0.3em] text-cyan-300/80'>AI Interview Report</p>
          <h1 className='mt-2 text-3xl font-black tracking-tight'>{session.jobTitle}</h1>
          <p className='mt-2 text-slate-300'>{report.summary || "Detailed performance insights based on your interview responses."}</p>

          <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            {scoreCards.map((card) => (
              <div key={card.label} className='rounded-2xl border border-white/10 bg-white/5 p-4 text-center'>
                <p className='text-xs uppercase tracking-wide text-slate-400'>{card.label}</p>
                <p className='mt-2 text-2xl font-black text-white'>{card.value || 0}%</p>
              </div>
            ))}
          </div>

          <div className='mt-8 grid gap-4 md:grid-cols-2'>
            <div className='rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5'>
              <h2 className='text-lg font-bold text-emerald-100'>Strong Topics</h2>
              <div className='mt-3 flex flex-wrap gap-2'>
                {(report.strongTopics || []).length > 0 ? (
                  report.strongTopics.map((topic, index) => (
                    <Badge key={`${topic}-${index}`} className='border border-emerald-400/30 bg-emerald-500/20 text-emerald-100'>
                      {topic}
                    </Badge>
                  ))
                ) : (
                  <p className='text-sm text-emerald-100/80'>No clear strong topics yet.</p>
                )}
              </div>
            </div>

            <div className='rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5'>
              <h2 className='text-lg font-bold text-amber-100'>Weak Topics</h2>
              <div className='mt-3 flex flex-wrap gap-2'>
                {(report.weakTopics || []).length > 0 ? (
                  report.weakTopics.map((topic, index) => (
                    <Badge key={`${topic}-${index}`} className='border border-amber-400/30 bg-amber-500/20 text-amber-100'>
                      {topic}
                    </Badge>
                  ))
                ) : (
                  <p className='text-sm text-amber-100/80'>No weak topics detected.</p>
                )}
              </div>
            </div>
          </div>

          <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 p-5'>
            <h2 className='text-lg font-bold text-white'>Recommended Learning Path</h2>
            <ul className='mt-3 space-y-2 text-slate-200'>
              {(report.recommendedLearningPath || []).length > 0 ? (
                report.recommendedLearningPath.map((item, index) => (
                  <li key={`${item}-${index}`}>{index + 1}. {item}</li>
                ))
              ) : (
                <li>No recommendations available yet.</li>
              )}
            </ul>
          </div>

          <div className='mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5'>
            <h2 className='text-lg font-bold text-cyan-100'>Hiring Recommendation</h2>
            <p className='mt-2 text-cyan-50'>{report.hiringRecommendation || "Needs further evaluation."}</p>
          </div>

          <div className='mt-8 flex flex-wrap gap-3'>
            <Button className='bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white hover:from-[#fb923c] hover:to-[#f472b6]' onClick={() => navigate("/jobs")}>Explore More Jobs</Button>
            <Button variant='outline' className='border-white/10 bg-white/5 text-slate-100 hover:bg-white/10' onClick={() => navigate("/profile")}>Back to Profile</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewReport;
