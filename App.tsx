
import React, { useState, useEffect } from 'react';
import { Section, MockTest, TestAttempt, AIAnalysis } from './types';
import { CMAT_MOCK_TESTS } from './data/mockTests';
import { getAIAnalysis, getQuestionExplanation } from './services/geminiService';
import { Button } from './components/Button';
import { 
  BookOpen, 
  Clock, 
  BarChart2, 
  Settings, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  BrainCircuit,
  Loader2,
  Trophy
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

type View = 'DASHBOARD' | 'TEST_MODE' | 'ANALYSIS';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<TestAttempt | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [explainingQuestionId, setExplainingQuestionId] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  useEffect(() => {
    let timer: number;
    if (currentView === 'TEST_MODE' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentView === 'TEST_MODE') {
      handleSubmitTest();
    }
    return () => clearInterval(timer);
  }, [currentView, timeLeft]);

  const startTest = (test: MockTest) => {
    setActiveTest(test);
    setTimeLeft(test.duration * 60);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setCurrentView('TEST_MODE');
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const calculateScore = () => {
    if (!activeTest) return { total: 0, sectionWise: {} as Record<Section, number> };
    let total = 0;
    const sectionWise: Record<Section, number> = {
      [Section.QUANT]: 0,
      [Section.LOGICAL]: 0,
      [Section.LANGUAGE]: 0,
      [Section.GENERAL]: 0,
      [Section.INNOVATION]: 0
    };

    activeTest.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        total += 4;
        sectionWise[q.section] += 4;
      } else if (userAnswers[q.id] !== undefined) {
        total -= 1;
        sectionWise[q.section] -= 1;
      }
    });

    return { total, sectionWise };
  };

  const handleSubmitTest = async () => {
    const { total, sectionWise } = calculateScore();
    const attempt: TestAttempt = {
      testId: activeTest?.id || '',
      score: total,
      answers: userAnswers,
      completedAt: new Date(),
      sectionWiseScores: sectionWise
    };

    setLastAttempt(attempt);
    setCurrentView('ANALYSIS');
    
    setIsAnalyzing(true);
    try {
      const analysis = await getAIAnalysis(attempt, activeTest?.title || '');
      setAiAnalysis(analysis);
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getExplanation = async (qId: string) => {
    const q = activeTest?.questions.find(q => q.id === qId);
    if (!q) return;
    
    setExplainingQuestionId(qId);
    setAiExplanation(null);
    try {
      const explanation = await getQuestionExplanation(q.question, q.options, q.options[q.correctAnswer]);
      setAiExplanation(explanation);
    } catch (error) {
      setAiExplanation("Could not load explanation at this time.");
    }
  };

  const accuracyData = lastAttempt ? [
    { name: 'Correct', value: Object.values(lastAttempt.answers).filter((v, i) => v === activeTest?.questions[i].correctAnswer).length },
    { name: 'Incorrect', value: Object.values(lastAttempt.answers).filter((v, i) => v !== activeTest?.questions[i].correctAnswer).length },
    { name: 'Unanswered', value: activeTest!.questions.length - Object.keys(lastAttempt.answers).length }
  ] : [];

  const COLORS = ['#10b981', '#ef4444', '#94a3b8'];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('DASHBOARD')}>
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <BookOpen size={24} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            CMAT Ace
          </h1>
        </div>
        
        {currentView === 'TEST_MODE' && activeTest && (
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-1.5 rounded-full">
            <Clock size={18} className="text-indigo-600" />
            <span className={`font-mono font-bold text-lg ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Settings size={18} className="mr-2" /> Settings
          </Button>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
            JD
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {currentView === 'DASHBOARD' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-4 max-w-2xl">
                <h2 className="text-3xl font-bold">Welcome back, Aspirant! 🚀</h2>
                <p className="text-indigo-100 text-lg">
                  Boost your CMAT preparation with structured mock tests and real-time AI feedback.
                </p>
                <div className="flex gap-4">
                  <Button variant="secondary" onClick={() => startTest(CMAT_MOCK_TESTS[0])}>
                    Take New Mock Test <ArrowRight size={18} className="ml-2" />
                  </Button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <BarChart2 className="text-indigo-600" /> Available Mock Tests
                </h3>
                <div className="grid gap-4">
                  {CMAT_MOCK_TESTS.map(test => (
                    <div key={test.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{test.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-slate-500 text-sm">
                            <span className="flex items-center gap-1"><Clock size={14} /> {test.duration} mins</span>
                            <span className="flex items-center gap-1"><BookOpen size={14} /> {test.questions.length} Questions</span>
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => startTest(test)}>Start Test</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-400">Previous Performance</h3>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-64 flex flex-col items-center justify-center text-slate-400 italic">
                  No previous attempts found.
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'TEST_MODE' && activeTest && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in slide-in-from-right duration-500">
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                  Section: {activeTest.questions[currentQuestionIndex].section}
                </span>
                <span className="text-slate-500">Question {currentQuestionIndex + 1} of {activeTest.questions.length}</span>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
                <h3 className="text-xl font-medium leading-relaxed mb-8">
                  {activeTest.questions[currentQuestionIndex].question}
                </h3>

                <div className="grid gap-4">
                  {activeTest.questions[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(activeTest.questions[currentQuestionIndex].id, idx)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        userAnswers[activeTest.questions[currentQuestionIndex].id] === idx
                          ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                          : 'border-slate-100 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold ${
                        userAnswers[activeTest.questions[currentQuestionIndex].id] === idx
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-500 border-slate-200'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky bottom-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft size={18} className="mr-2" /> Previous
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="danger" onClick={handleSubmitTest}>Submit Test</Button>
                  {currentQuestionIndex < activeTest.questions.length - 1 ? (
                    <Button 
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(activeTest.questions.length - 1, prev + 1))}
                    >
                      Next <ChevronRight size={18} className="ml-2" />
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={handleSubmitTest}>Finish</Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <BrainCircuit size={18} className="text-indigo-600" /> Question Palette
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {activeTest.questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        currentQuestionIndex === idx
                          ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-offset-2 ring-indigo-600'
                          : userAnswers[q.id] !== undefined
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'ANALYSIS' && lastAttempt && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Trophy className="text-yellow-500" /> Results & Analysis
              </h2>
              <Button onClick={() => setCurrentView('DASHBOARD')}>Back Home</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Total Score</p>
                <h3 className="text-4xl font-black text-indigo-600">{lastAttempt.score} <span className="text-lg text-slate-400">/ 400</span></h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Accuracy</p>
                <h3 className="text-4xl font-black text-green-600">
                  {Math.round((Object.values(lastAttempt.answers).filter((v, i) => v === activeTest?.questions[i].correctAnswer).length / activeTest!.questions.length) * 100)}%
                </h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Questions Answered</p>
                <h3 className="text-4xl font-black text-slate-800">{Object.keys(lastAttempt.answers).length}</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Rank Projection</p>
                <h3 className="text-4xl font-black text-purple-600">95%ile</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="text-xl font-bold mb-4">Response Accuracy</h4>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={accuracyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {accuracyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-xs mt-2">
                   {accuracyData.map((entry, index) => (
                     <div key={index} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
                        <span>{entry.name}</span>
                     </div>
                   ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BrainCircuit className="text-indigo-400" /> Gemini AI Insight
                  </h4>
                  
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader2 className="animate-spin text-indigo-400" size={48} />
                      <p className="text-slate-400">Gemini is synthesizing your analysis...</p>
                    </div>
                  ) : aiAnalysis ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-green-400 text-xs font-bold uppercase mb-2">Strengths</p>
                          <ul className="space-y-1">
                            {aiAnalysis.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-slate-300 leading-tight flex items-start gap-1">
                                <span>•</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-red-400 text-xs font-bold uppercase mb-2">Needs Focus</p>
                          <ul className="space-y-1">
                            {aiAnalysis.weaknesses.map((w, i) => (
                              <li key={i} className="text-sm text-slate-300 leading-tight flex items-start gap-1">
                                <span>•</span> {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <p className="text-indigo-300 text-xs font-bold uppercase mb-1">Growth Path</p>
                        <p className="text-slate-300 text-sm leading-relaxed">{aiAnalysis.improvementPlan}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400">Analysis failed to load.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xl font-bold">Review Questions</h4>
              <div className="grid gap-4">
                {activeTest?.questions.map((q, idx) => {
                  const isCorrect = lastAttempt.answers[q.id] === q.correctAnswer;
                  const isUnanswered = lastAttempt.answers[q.id] === undefined;

                  return (
                    <div key={q.id} className={`bg-white p-6 rounded-2xl border ${isCorrect ? 'border-green-200' : isUnanswered ? 'border-slate-200' : 'border-red-200'} shadow-sm`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-400">#{idx + 1}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCorrect ? 'bg-green-100 text-green-700' : isUnanswered ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'
                          }`}>
                            {isCorrect ? 'Correct' : isUnanswered ? 'Unanswered' : 'Incorrect'}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => getExplanation(q.id)}
                          disabled={explainingQuestionId === q.id}
                        >
                          {explainingQuestionId === q.id ? <Loader2 className="animate-spin mr-2" size={14} /> : <BrainCircuit size={14} className="mr-2" />}
                          AI Explanation
                        </Button>
                      </div>
                      
                      <p className="font-medium mb-4">{q.question}</p>
                      
                      {explainingQuestionId === q.id && aiExplanation && (
                        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl animate-in slide-in-from-top duration-300">
                          <p className="text-indigo-700 text-sm font-bold mb-1 flex items-center gap-2">
                            <BrainCircuit size={14} /> Gemini Explanation:
                          </p>
                          <p className="text-slate-700 text-sm whitespace-pre-wrap">{aiExplanation}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, oIdx) => (
                          <div 
                            key={oIdx} 
                            className={`p-3 rounded-lg border text-sm flex items-center justify-between ${
                              oIdx === q.correctAnswer 
                                ? 'bg-green-50 border-green-200 text-green-800 font-medium' 
                                : lastAttempt.answers[q.id] === oIdx
                                ? 'bg-red-50 border-red-200 text-red-800'
                                : 'border-slate-100 text-slate-500'
                            }`}
                          >
                            <span>{opt}</span>
                            {oIdx === q.correctAnswer && <CheckCircle2 size={16} className="text-green-600" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-slate-500 text-sm">
        <p>© 2024 CMAT Ace - Mock Test Platform</p>
      </footer>
    </div>
  );
};

export default App;
