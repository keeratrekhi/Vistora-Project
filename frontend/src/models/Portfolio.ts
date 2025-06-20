export interface PortfolioEventProps {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
  link: string;
}

export interface Address {
  area: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface SocialLink {
  facebookLink?: string;
  twitterLink?: string;
  instagramLink?: string;
  youtubeLink?: string;
  websiteLink?: string;
}

export interface GeneralInfo {
  name: string;
  studioName: string;
  description?: string;
  contact?: string;
  email?: string;
  address?: Address;
}

export interface PortfolioInfoModel {
  generalInfo: GeneralInfo;
  socialLinks?: SocialLink;
  logo?: string;
  coverImage?: string;
  userId?: string;
}

export interface PortfolioDto{
  id? : string;
  portfolioQrCode? : string;
  name? : string;
  studioName?:string;
  description? : string;
  contact? : string;
  email? : string;
  area? : string;
  city? : string;
  state? : string;
  country? : string;
  postalCode? : string;
  facebookLink? : string;
  instagramLink? : string;
  twitterLink? : string;
  youtubeLink? : string;
  websiteLink? : string;
  userId? : string;
}