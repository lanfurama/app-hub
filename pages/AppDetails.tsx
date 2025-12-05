import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../hooks/useAppStore';
import { Button, Card, Badge, Input, TextArea } from '../components/UI';
import { ArrowLeft, Github, ExternalLink, ThumbsUp, MessageSquare, Bug, Lightbulb, Sparkles, AlertTriangle, Hammer, Terminal } from 'lucide-react';
import { FeedbackType, Feedback, AIAnalysisResult } from '../types';
import { generateAppInsights } from '../services/geminiService';

export const AppDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getApp, getAppFeedbacks, addFeedback, voteFeedback } = useAppStore();
  const [activeTab, setActiveTab] = useState<'feedback' | 'ai'>('feedback');
  
  // App Data
  const app = getApp(id || '');
  const feedbacks = getAppFeedbacks(id || '');

  // Form State
  const [newFeedbackType, setNewFeedbackType] = useState<FeedbackType>(FeedbackType.OTHER);
  const [newFeedbackTitle, setNewFeedbackTitle] = useState('');
  const [newFeedbackDesc, setNewFeedbackDesc] = useState('');
  const [newFeedbackAuthor, setNewFeedbackAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!app) {
    return (
        <div className="max-w-4xl mx-auto p-8 text-center">
            <h2 className="text-2xl font-bold">App not found</h2>
            <Link to="/" className="text-indigo-600 hover:underline mt-4 block">Back to Dashboard</Link>
        </div>
    );
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackTitle || !newFeedbackDesc) return;
    
    setIsSubmitting(true);
    try {
        await addFeedback({
            appId: app.id,
            type: newFeedbackType,
            title: newFeedbackTitle,
            description: newFeedbackDesc,
            author: newFeedbackAuthor || 'Anonymous'
        });
        setNewFeedbackTitle('');
        setNewFeedbackDesc('');
        setNewFeedbackAuthor('');
        setNewFeedbackType(FeedbackType.OTHER);
    } catch (error) {
        console.error('Error creating feedback:', error);
        alert('Failed to create feedback. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleRunAI = async () => {
      setIsAnalyzing(true);
      setAiError(null);
      try {
          const result = await generateAppInsights(app, feedbacks);
          setAiAnalysis(result);
      } catch (err: any) {
          setAiError("Failed to generate AI insights. Check your API Key configuration or try again later.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const getFeedbackIcon = (type: FeedbackType) => {
      switch(type) {
          case FeedbackType.BUG: return <Bug className="w-4 h-4 text-red-500" />;
          case FeedbackType.FEATURE: return <Lightbulb className="w-4 h-4 text-yellow-500" />;
          case FeedbackType.IMPROVEMENT: return <Hammer className="w-4 h-4 text-blue-500" />;
          default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
                <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold text-gray-900">{app.name}</h1>
                    <div className="flex space-x-2">
                        {app.techStack.map(t => <Badge key={t} color="blue">{t}</Badge>)}
                    </div>
                </div>
                <p className="mt-2 text-gray-600 text-lg">{app.description}</p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 flex space-x-3">
                {app.githubUrl && (
                    <a href={app.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" icon={Github}>GitHub</Button>
                    </a>
                )}
                {app.demoUrl && (
                    <a href={app.demoUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="primary" icon={ExternalLink}>Live Demo</Button>
                    </a>
                )}
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`${activeTab === 'feedback' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Feedback & Bugs
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">{feedbacks.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`${activeTab === 'ai' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Insights
          </button>
        </nav>
      </div>

      {/* Feedback Tab Content */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feedback List */}
            <div className="lg:col-span-2 space-y-4">
                {feedbacks.length === 0 ? (
                    <div className="text-center p-10 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                        <p className="text-gray-500">No feedback yet. Be the first!</p>
                    </div>
                ) : (
                    feedbacks.map(item => (
                        <Card key={item.id} className="p-4 hover:bg-gray-50 transition">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-1 p-1.5 rounded-full bg-gray-100`}>
                                        {getFeedbackIcon(item.type)}
                                    </div>
                                    <div>
                                        <h4 className="text-base font-semibold text-gray-900">{item.title}</h4>
                                        <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                                        <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                                            <span className="font-medium text-gray-900">{item.author}</span>
                                            <span>•</span>
                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <Badge color={item.status === 'RESOLVED' ? 'green' : item.status === 'IN_PROGRESS' ? 'yellow' : 'gray'}>
                                                {item.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center ml-4">
                                    <button 
                                        onClick={async () => {
                                            try {
                                                await voteFeedback(item.id);
                                            } catch (error) {
                                                console.error('Error voting feedback:', error);
                                                alert('Failed to vote. Please try again.');
                                            }
                                        }}
                                        className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"
                                    >
                                        <ThumbsUp className="w-5 h-5" />
                                        <span className="text-xs font-bold mt-1">{item.votes}</span>
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Add Feedback Form */}
            <div className="lg:col-span-1">
                <Card className="p-6 sticky top-24">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Feedback</h3>
                    <form onSubmit={handleSubmitFeedback}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <div className="flex space-x-2">
                                {[FeedbackType.BUG, FeedbackType.FEATURE, FeedbackType.IMPROVEMENT, FeedbackType.OTHER].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setNewFeedbackType(type)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
                                            newFeedbackType === type 
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Input 
                            label="Title" 
                            placeholder="Brief summary..." 
                            value={newFeedbackTitle}
                            onChange={e => setNewFeedbackTitle(e.target.value)}
                            required
                        />
                        <TextArea 
                            label="Description" 
                            rows={4} 
                            placeholder="Details, steps to reproduce, etc."
                            value={newFeedbackDesc}
                            onChange={e => setNewFeedbackDesc(e.target.value)}
                            required 
                        />
                        <Input 
                            label="Your Name (Optional)" 
                            placeholder="John Doe" 
                            value={newFeedbackAuthor}
                            onChange={e => setNewFeedbackAuthor(e.target.value)}
                        />
                        <Button type="submit" className="w-full" isLoading={isSubmitting}>
                            Submit Feedback
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
      )}

      {/* AI Tab Content */}
      {activeTab === 'ai' && (
          <div className="space-y-6">
              {!aiAnalysis && !isAnalyzing && (
                  <div className="text-center py-12 bg-indigo-50 rounded-xl border border-indigo-100">
                      <Sparkles className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Generate AI Product Insights</h3>
                      <p className="mt-2 text-gray-600 max-w-md mx-auto mb-6">
                          Let Gemini analyze your app description and user feedback to provide a summary, feature suggestions, and identify potential technical risks.
                      </p>
                      <Button onClick={handleRunAI} icon={Sparkles}>Analyze with Gemini</Button>
                      {aiError && (
                          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md max-w-md mx-auto text-sm">
                              {aiError}
                          </div>
                      )}
                  </div>
              )}

              {isAnalyzing && (
                  <div className="flex flex-col items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                      <p className="text-gray-500">Gemini is analyzing your app context...</p>
                  </div>
              )}

              {aiAnalysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                      <Card className="md:col-span-2 p-6 bg-gradient-to-r from-indigo-50 to-white">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center mb-3">
                              <Terminal className="w-5 h-5 mr-2 text-indigo-600" />
                              Executive Summary
                          </h3>
                          <p className="text-gray-700 leading-relaxed">{aiAnalysis.summary}</p>
                      </Card>

                      <Card className="p-6 border-l-4 border-green-500">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                              <Lightbulb className="w-5 h-5 mr-2 text-green-600" />
                              Suggested Features
                          </h3>
                          <ul className="space-y-3">
                              {aiAnalysis.suggestions.map((s, i) => (
                                  <li key={i} className="flex items-start">
                                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold mr-3">{i + 1}</span>
                                      <span className="text-gray-700 text-sm">{s}</span>
                                  </li>
                              ))}
                          </ul>
                      </Card>

                      <Card className="p-6 border-l-4 border-orange-500">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                              Technical Challenges
                          </h3>
                          <ul className="space-y-3">
                              {aiAnalysis.technicalChallenges.map((s, i) => (
                                  <li key={i} className="flex items-start">
                                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-xs font-bold mr-3">{i + 1}</span>
                                      <span className="text-gray-700 text-sm">{s}</span>
                                  </li>
                              ))}
                          </ul>
                      </Card>
                      
                      <div className="md:col-span-2 flex justify-end">
                         <Button variant="ghost" onClick={handleRunAI} size="sm">Regenerate Analysis</Button>
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};