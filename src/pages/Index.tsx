
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { initializeDemoData } from '@/services/mockServices';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { ArrowRight, BookOpen, Trophy, User, Database } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Initialize demo data
    initializeDemoData();
  }, []);
  
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'teacher' ? '/teacher' : '/student');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-20 px-4 header-gradient text-white">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Exam Vault RVITM
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 animate-fade-in opacity-90">
              An advanced online examination platform for RVITM students and teachers.
            </p>
            <Button 
              onClick={handleGetStarted} 
              className="text-exam-primary bg-white hover:bg-white/90 px-8 py-6 text-lg animate-scale-in"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-105">
                <div className="w-12 h-12 bg-exam-primary rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="text-white h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Online Examinations</h3>
                <p className="text-muted-foreground">
                  Take exams anytime with easy-to-use interface and automatic grading.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-105">
                <div className="w-12 h-12 bg-exam-vivid rounded-full flex items-center justify-center mb-4">
                  <Trophy className="text-white h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Performance Tracking</h3>
                <p className="text-muted-foreground">
                  Track your progress with detailed results and performance analytics.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-105">
                <div className="w-12 h-12 bg-exam-light rounded-full flex items-center justify-center mb-4">
                  <User className="text-exam-vivid h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Teacher Dashboard</h3>
                <p className="text-muted-foreground">
                  Create and manage exams, view student results, and download reports.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-105">
                <div className="w-12 h-12 bg-exam-primary rounded-full flex items-center justify-center mb-4">
                  <Database className="text-white h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Question Bank</h3>
                <p className="text-muted-foreground">
                  Create questions with different difficulty levels for comprehensive assessment.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-105">
                <div className="w-12 h-12 bg-exam-vivid rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white h-6 w-6">
                    <path d="M18 22H7c-1.7 0-3-1.3-3-3V5c0-1.7 1.3-3 3-3h7l6 6v11c0 1.7-1.3 3-3 3Z"></path>
                    <path d="M13 2v6h6"></path>
                    <circle cx="10" cy="13" r="2"></circle>
                    <path d="m20 17-3.5-2-3.5 2V9"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Result Export</h3>
                <p className="text-muted-foreground">
                  Download exam results as CSV files for further analysis and record keeping.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-105">
                <div className="w-12 h-12 bg-exam-light rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-exam-vivid h-6 w-6">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <line x1="3" x2="21" y1="9" y2="9"></line>
                    <line x1="3" x2="21" y1="15" y2="15"></line>
                    <line x1="9" x2="9" y1="3" y2="21"></line>
                    <line x1="15" x2="15" y1="3" y2="21"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Responsive Design</h3>
                <p className="text-muted-foreground">
                  Access the platform on any device with a fully responsive design.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold mr-4 mt-1">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Register & Login</h3>
                      <p className="text-muted-foreground">
                        Sign up with your RVITM email and complete your profile information.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold mr-4 mt-1">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Browse Available Exams</h3>
                      <p className="text-muted-foreground">
                        View the list of available exams created by teachers for your department.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold mr-4 mt-1">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Take Exams</h3>
                      <p className="text-muted-foreground">
                        Complete exams within the allocated time and get instant results.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold mr-4 mt-1">
                      4
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">View Performance</h3>
                      <p className="text-muted-foreground">
                        Check your results, view detailed performance analytics, and track your progress.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-100 p-8 rounded-lg shadow-inner">
              <a href="https://ibb.co/4hw37yZ"><img src="https://i.ibb.co/nxqtb2s/1000078909.jpg" alt="1000078909"  /></a>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4 gradient-primary text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Join Exam Vault RVITM today and experience a modern approach to online examinations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-white border-white bg-[#222e3a] hover:text-exam-primary"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
