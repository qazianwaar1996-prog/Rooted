import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Articles from './pages/Articles';
import ExpertProfile from './pages/ExpertProfile';
import MilestoneTracker from './pages/MilestoneTracker';
import ScreenTime from './pages/ScreenTime';
import Quiz from './pages/Quiz';
import ArticlePage from './pages/Article';
import Courses from './pages/Courses';
import Community from './pages/Community';
import Resources from './pages/Resources';
import Experts from './pages/Experts';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:slug" element={<ArticlePage />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/community" element={<Community />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/milestone-tracker" element={<MilestoneTracker />} />
            <Route path="/resources/screen-time" element={<ScreenTime />} />
            <Route path="/resources/quiz" element={<Quiz />} />
            <Route path="/experts" element={<Experts />} />
            <Route path="/experts/:id" element={<ExpertProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
