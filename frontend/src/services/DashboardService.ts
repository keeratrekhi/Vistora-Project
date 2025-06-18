import { PortfolioDto, PortfolioInfoModel } from "@/models/Portfolio";
import { APIService } from "./APIService";
import { UserStorageDto } from "@/models/User";

const env = import.meta.env;


export interface EventDto {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  date: string;
  publishedUrl:string;
}

export interface CoverDto {
  coverImage: string | null;
}


export const getPortfolioURL = async (id : String): Promise<String> => {
  const response = await APIService.get<PortfolioDto>(`${env.VITE_PORTFOLIO_URL}/${id}`);
  return response.data.name;
};

export const getPortfolio = async (id : String): Promise<PortfolioDto> => {
    const response = await APIService.get<PortfolioDto>(`${env.VITE_PORTFOLIO_URL}/${id}`);
    return response.data;
}

export const getPortfolioSite = async (name : String): Promise<PortfolioDto> => {
    const response = await APIService.get<PortfolioDto>(`${env.VITE_PUBLIC_EVENTS_URL}/getport/${name}`);
    return response.data;
}

export const getPortfolioevents = async (
  userId: string
): Promise<EventDto[]> => {
  const response = await APIService.get<EventDto[]>(
    `${env.VITE_PUBLIC_EVENTS_URL}/events/${userId}`
  );
  return response.data;
};



export interface CoverFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface CoverDto {
  covers: CoverFile[];
}

export const getPorteventCover = async (
  eventId: string
): Promise<CoverDto> => {
  const response = await APIService.get<CoverDto>(
    `${env.VITE_PUBLIC_EVENTS_URL}/porteventcover/${eventId}`
  );
  return response.data;
};


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
    const response = await APIService.get(`${env.VITE_PUBLIC_EVENTS_URL}/portfoliocover/${encodeURIComponent(portfolioName)}?userId=${encodeURIComponent(userId)}`);
    return response.data;
}

export const deleteCoverImage = async (userId : string, coverImage : string, portfolioName : string) : Promise<void> => {
    await APIService.delete(`${env.VITE_BACKEND_URL}/s3/portfoliocover/${encodeURIComponent(portfolioName)}/${encodeURIComponent(coverImage)}?userId=${encodeURIComponent(userId)}`);
    return;
}