import Header from "../components/portfolio/Header";
import Footer from "../components/portfolio/Footer";
import PortfolioEvent from "../components/portfolio/PortfolioEvent";
import { PortfolioInfoModel } from "../models/Portfolio";
import { useEffect, useState } from "react";
import ComingSoon from "./ComingSoon";

const Profile = () => {

  const [portfolioInfo, setPortfolioInfo] = useState<PortfolioInfoModel | null>(null);

  useEffect(() => {
    const localStorageInfo = localStorage.getItem("portfolioInfo");
    if (!localStorageInfo) {
      //TODO : fetch info from backend
      return;
    }
    const parsedInformation = JSON.parse(localStorageInfo);
    setPortfolioInfo(parsedInformation);
  }, []);

  if(!portfolioInfo?.generalInfo.name) {
    return <ComingSoon />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header info={portfolioInfo} />

      <main className="pt-20 pb-16">
        <section className="relative h-[60vh] bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {portfolioInfo.generalInfo.name || "Welcome to My Portfolio"}
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl">
              {portfolioInfo.generalInfo.description ||
                "Passionate about creating beautiful and functional digital experiences"}
            </p>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PortfolioEvent />
        </section>
      </main>

      <Footer info={portfolioInfo} />
    </div>
  );
};

export default Profile;
