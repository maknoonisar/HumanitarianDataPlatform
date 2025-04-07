import HeroSection from "@/components/home/HeroSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import DataCatalogSection from "@/components/home/DataCatalogSection";
import DataVisualizationSection from "@/components/home/DataVisualizationSection";
import OrganizationsSection from "@/components/home/OrganizationsSection";
import CallToAction from "@/components/home/CallToAction";
import Footer from "@/components/layout/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      
      <StatisticsSection />
      
      <main className="py-12 flex-grow">
        <div className="container mx-auto px-4">
          <DataCatalogSection />
          
          <DataVisualizationSection />
          
          <OrganizationsSection />
        </div>
      </main>
      
      <CallToAction />
      
      <Footer />
    </div>
  );
};

export default HomePage;
