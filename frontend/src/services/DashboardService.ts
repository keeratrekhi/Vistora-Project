import { PortfolioDto, PortfolioInfoModel } from "@/models/Portfolio";
import { APIService } from "./APIService";
import { UserStorageDto } from "@/models/User";

const env = import.meta.env;

export const getPortfolioURL = async (id : String): Promise<String> => {
  const response = await APIService.get<PortfolioDto>(`${env.VITE_PORTFOLIO_URL}/${id}`);
  return response.data.portfolioQrCode;
};

export const getPortfolio = async (id : String): Promise<PortfolioDto> => {
    const response = await APIService.get<PortfolioDto>(`${env.VITE_PORTFOLIO_URL}/${id}`);
    return response.data;
}

export const getPortfolioSite = async (name : String): Promise<PortfolioDto> => {
    const response = await APIService.get<PortfolioDto>(`${env.VITE_PORTFOLIO_URL}/getport/${name}`);
    return response.data;
}

export const createPortfolio = async (portfolioInfo: PortfolioInfoModel): Promise<void> => {
    await APIService.post<PortfolioDto, PortfolioInfoModel>(env.VITE_PORTFOLIO_URL, portfolioInfo);
    return;
}

export const getUserStorageInfo = async (userId: String): Promise<UserStorageDto> => {
    const response = await APIService.get<UserStorageDto>(`${env.VITE_STORAGE_URL}/${userId}`);
    return response.data;
}

export const uploadCoverImage = async(userId : string, portfolioName : string, file : FormData): Promise<void> => {
    await APIService.post(
        `${env.VITE_BUCKET_URL}/uploadportfoliocover/${encodeURIComponent(portfolioName)}?userId=${encodeURIComponent(userId)}`, 
        file);
    return;
}

export const fetchCoverImage = async (userId : string, portfolioName: string): Promise<{}> => {
    const response = await APIService.get(`${env.VITE_BUCKET_URL}/portfoliocover/${encodeURIComponent(portfolioName)}?userId=${encodeURIComponent(userId)}`);
    return response.data;
}

export const deleteCoverImage = async (userId : string, coverImage : string, portfolioName : string) : Promise<void> => {
    await APIService.delete(`http://localhost:3000/s3/portfoliocover/${encodeURIComponent(portfolioName)}/${encodeURIComponent(coverImage)}?userId=${encodeURIComponent(userId)}`);
    return;
}