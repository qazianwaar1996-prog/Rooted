import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Reveal from './components/Reveal';

// ── Page loader shown while lazy chunks load ─────────────────
const PageLoader = () => (
  <div style={{
    display:'flex', alignItems:'center',
    justifyContent:'center', minHeight:'60vh',
    flexDirection:'column', gap:'16px',
    fontFamily:'var(--font-body)', color:'var(--stone)'
  }}>
    <div style={{
      width:'36px', height:'36px',
      border:'3px solid var(--sand)',
      borderTopColor:'var(--forest)',
      borderRadius:'50%',
      animation:'spin 0.8s linear infinite'
    }} />
    <span style={{fontSize:'0.9rem'}}>Loading…</span>
    <style>
      {'@keyframes spin{to{transform:rotate(360deg)}}'}
    </style>
  </div>
);

// ── Code-split lazily loaded pages ──────────────────────────
const Home = lazy(() => import('./pages/Home'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticlePage = lazy(() => import('./pages/Article'));
const Courses = lazy(() => import('./pages/Courses'));
const Community = lazy(() => import('./pages/Community'));
const CommunityPost = lazy(() => import('./pages/CommunityPost'));
const Resources = lazy(() => import('./pages/Resources'));
const MilestoneTracker = lazy(() => import('./pages/MilestoneTracker'));
const ScreenTime = lazy(() => import('./pages/ScreenTime'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Experts = lazy(() => import('./pages/Experts'));
const ExpertProfile = lazy(() => import('./pages/ExpertProfile'));
const About = lazy(() => import('./pages/About'));
const Pricing = lazy(() => import('./pages/Pricing'));
const PricingSuccess = lazy(() => import('./pages/PricingSuccess'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

function App() {
  return (
    <BrowserRouter basename="/Rooted">
      <div className="app-root">
        <Reveal />
        <Navbar />
        <main className="main-content">
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:slug" element={<ArticlePage />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/:postId" element={<CommunityPost />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/milestone-tracker" element={<MilestoneTracker />} />
            <Route path="/resources/screen-time" element={<ScreenTime />} />
            <Route path="/resources/quiz" element={<Quiz />} />
            <Route path="/experts" element={<Experts />} />
            <Route path="/experts/:id" element={<ExpertProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/pricing/success" element={<PricingSuccess />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={
              <ProtectedRoute><Onboarding /></ProtectedRoute>
            } />
            <Route path="/admin" element={<Admin />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
