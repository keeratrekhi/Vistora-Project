import { PortfolioDto, PortfolioInfoModel } from "@/models/Portfolio";
import { APIService } from "./APIService";

const env = import.meta.env;

export const getPortfolioQrCode = async (id : String): Promise<String> => {
  const response = await APIService.get<PortfolioDto>(`${env.VITE_PORTFOLIO_URL}/${id}`);
  return response.data.portfolioQrCode;
};

export const getPortfolio = async (id : String): Promise<PortfolioDto> => {
    const response = await APIService.get<PortfolioDto>(`${env.VITE_PORTFOLIO_URL}/${id}`);
    return response.data;
}

export const createPortfolio = async (portfolioInfo: PortfolioInfoModel): Promise<void> => {
    await APIService.post<PortfolioDto, PortfolioInfoModel>(env.VITE_PORTFOLIO_URL, portfolioInfo);
    return;
}