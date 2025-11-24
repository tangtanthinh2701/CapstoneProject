import ChatButton from '../../components/templates/Button/ChatButton';
import Footer from '../../components/templates/Footer/Footer';
import Navbar from '../../components/templates/Navbar/Navbar';
import ActivityTimelineSection from '../../components/templates/Section/ActivityTimeline';
import BenefitsSection from '../../components/templates/Section/Benefits';
import BlogSection from '../../components/templates/Section/Blog';
import CalendarWorkflowSection from '../../components/templates/Section/CalendarWorkflow';
import CTASection from '../../components/templates/Section/CTA';
import HeroSection from '../../components/templates/Section/Hero';
import IntegrationsSection from '../../components/templates/Section/Integrations';
import ReportsSection from '../../components/templates/Section/Reports';
import TeamNetworkSection from '../../components/templates/Section/TeamNetwork';
import TestimonialsSection from '../../components/templates/Section/Testimonials';
import TrustedBySection from '../../components/templates/Section/TrustedBy';

function HomePage() {
  return (
    <div className='min-h-screen bg-white'>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      <Navbar />
      <HeroSection />
      <ActivityTimelineSection />
      <TeamNetworkSection />
      <CalendarWorkflowSection />
      <IntegrationsSection />
      <ReportsSection />
      <TrustedBySection />
      <TestimonialsSection />
      <BenefitsSection />
      <BlogSection />
      <CTASection />
      <Footer />
      <ChatButton />
    </div>
  );
}
export default HomePage;
