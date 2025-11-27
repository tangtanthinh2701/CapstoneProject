import AuctionProjects from '../../components/AuctionProjects';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import HeroSection from '../../components/HeroSection';
import ManagerTeam from '../../components/ManagerTeam';
import Partners from '../../components/Partners';
import Testimonials from '../../components/Testimonials';

function HomePage() {
  return (
    <div className='bg-[#07150D] text-white'>
      <Header />
      <HeroSection />
      <AuctionProjects />
      <ManagerTeam />
      <Partners />
      <Testimonials />
      <Footer />
    </div>
  );
}
export default HomePage;
