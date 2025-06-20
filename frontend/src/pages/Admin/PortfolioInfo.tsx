import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  createPortfolio,
  deleteCoverImage,
  fetchCoverImage,
  getPortfolio,
  uploadCoverImage,
} from "@/services/DashboardService";
import { PortfolioDto, PortfolioInfoModel } from "@/models/Portfolio";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PortfolioInfoFormData,
  portfolioInfoSchema,
} from "@/schema/portfolio.schema";
import {
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Trash2,
  Twitter,
  Upload,
  User,
  Youtube,
  Sparkles,
  Edit,
  Save,
  X,
  Camera,
} from "lucide-react";
import FormInput from "@/components/ui/Form/FormInput";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/loading-spinner";
import CollapsibleSection from "@/components/CollapsibleSection";

interface CoverFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case "facebook":
      return <Facebook className="w-4 h-4" />;
    case "twitter":
      return <Twitter className="w-4 h-4" />;
    case "instagram":
      return <Instagram className="w-4 h-4" />;
    case "youtube":
      return <Youtube className="w-4 h-4" />;
    case "website":
      return <Globe className="w-4 h-4" />;
    default:
      return <Globe />;
  }
};

const PortfolioInfo: React.FC = () => {
  // ... keep existing code (state declarations and hooks)
  const [fetchingPortfolio, setFetchingPortfolio] = useState<boolean>(false);
  const [fetchingCoverImage, setFetchingCoverImage] = useState<boolean>(false);
  const [uploadingCoverImage, setUploadingCoverImage] = useState<boolean>(false);
  const [updatingPortfolio, setUpdatingPortfolio] = useState<boolean>(false);
  const [portfolioInfo, setPortfolioInfo] = useState<PortfolioDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [coverImage, setCoverImage] = useState<CoverFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PortfolioInfoFormData>({
    resolver: zodResolver(portfolioInfoSchema),
    defaultValues: {
      generalInfo: {
        name: "",
        studioName:"",
        description: "",
        contact: "",
        email: "",
        address: {
          area: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
        },
      },
      socialLinks: {
        facebookLink: "",
        twitterLink: "",
        instagramLink: "",
        youtubeLink: "",
        websiteLink: "",
      },
      coverImage: "",
    },
  });

  const { currentUser } = useSelector(
    (state: {
      user: {
        currentUser: { id: string };
      };
    }) => state.user
  );
  const userId = currentUser.id;

  // ... keep existing code (useEffect, fetchPortfolio, fetchCover, handleSubmit functions)
  useEffect(() => {
    if (!userId) return;
    fetchPortfolio();
  }, [userId]);

  const fetchPortfolio = async () => {
    try {
      setFetchingPortfolio(true);
      const data = await getPortfolio(userId);
      setPortfolioInfo(data);
    } catch (err) {
      toast.error("Error fetching portfolio. Please try again later.");
    } finally {
      setFetchingPortfolio(false);
    }
  };

  const fetchCover = async (portfolioName: string) => {
    if (!portfolioName || !userId) {
      setCoverImage(null);
      return;
    }
    try {
      setFetchingCoverImage(true);
      const response: any = await fetchCoverImage(userId, portfolioName);
      const covers: CoverFile[] = response.covers;
      setCoverImage(covers.length > 0 ? covers[0] : null);
    } catch (err) {
      toast.error("Error fetching cover image. Please try again later.");
      setCoverImage(null);
    } finally {
      setFetchingCoverImage(false);
    }
  };

  useEffect(() => {
    if (portfolioInfo?.name) {
      fetchCover(portfolioInfo.name);
    }
    reset({
      generalInfo: {
        name: portfolioInfo?.name || "",
        studioName:portfolioInfo?.studioName|| "",
        description: portfolioInfo?.description || "",
        contact: portfolioInfo?.contact || "",
        email: portfolioInfo?.email || "",
        address: {
          area: portfolioInfo?.area || "",
          city: portfolioInfo?.city || "",
          state: portfolioInfo?.state || "",
          country: portfolioInfo?.country || "",
          postalCode: portfolioInfo?.postalCode || "",
        },
      },
      socialLinks: {
        facebookLink: portfolioInfo?.facebookLink || "",
        twitterLink: portfolioInfo?.twitterLink || "",
        instagramLink: portfolioInfo?.instagramLink || "",
        youtubeLink: portfolioInfo?.youtubeLink || "",
        websiteLink: portfolioInfo?.websiteLink || "",
      },
    });
  }, [portfolioInfo, reset]);

  const handlePortfolioInfoSubmit = async (data: PortfolioInfoFormData) => {
    try {
      setUpdatingPortfolio(true);
      await createPortfolio({
        userId,
        generalInfo: data.generalInfo,
        socialLinks: data.socialLinks,
      } as PortfolioInfoModel);
      const refreshed = await getPortfolio(userId);
      setPortfolioInfo(refreshed);
      toast.success("Portfolio updated");
    } catch (err) {
      toast.error("Failed to update portfolio. Please try again later.");
    } finally {
      setShowForm(false);
      setUpdatingPortfolio(false);
    }
  };

  const handleUpdateInfo = () => {
    setShowForm(true);
  };

  const handleUploadCover = async () => {
    try {
      setUploadingCoverImage(true);
      if (!fileInputRef.current?.files?.[0] || !portfolioInfo?.name) return;
      const file = fileInputRef.current.files[0];
      const formDataFile = new FormData();
      formDataFile.append("file", file);
      await uploadCoverImage(userId, portfolioInfo.name, formDataFile);
      setUploadingCoverImage(false);
      await fetchCover(portfolioInfo.name);
      toast.success("Cover image uploaded");
    } catch (err) {
      console.log("error : ", err);
      toast.error("Failed to upload cover image");
    } finally {
      setUploadingCoverImage(false);
    }
  };

  const handleDeleteCover = async () => {
    if (!coverImage || !portfolioInfo?.name) return;
    if (!window.confirm("Are you sure you want to delete the cover image?")) {
      return;
    }
    try {
      setUploadingCoverImage(true);
      await deleteCoverImage(userId, coverImage.name, portfolioInfo.name);
      setCoverImage(null);
      toast.success("Cover image deleted");
    } catch (err: any) {
      toast.error(`Failed to delete cover image`);
    } finally {
      setUploadingCoverImage(false);
    }
  };

  // ... keep existing code (loading states)
  if (fetchingPortfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 flex items-center justify-center">
        <div className="bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl animate-scale-in">
          <LoadingSpinner message="Loading your amazing portfolio..." />
        </div>
      </div>
    );
  }

  if (updatingPortfolio) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl animate-scale-in">
          <LoadingSpinner message="Updating your portfolio..." />
        </div>
      </div>
    );
  }

  // ... keep existing code (portfolio info display when !showForm)
  if (portfolioInfo && !showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/30 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-1/3 right-32 w-32 h-32 bg-pink-500/30 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-48 h-48 bg-cyan-500/30 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-2xl mb-6 animate-float">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Portfolio Dashboard
            </h1>
            <p className="text-slate-400 text-lg">Manage your creative portfolio</p>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center mb-8 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
            <div className="flex space-x-4">
              <button
                onClick={handleUpdateInfo}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-2xl group font-semibold"
              >
                <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                Update Info
              </button>
              <a
                href={`/portfolio/${encodeURIComponent(portfolioInfo.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-700/50 text-white px-6 py-3 rounded-xl hover:bg-slate-600/50 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-xl group border border-slate-600"
              >
                <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                View Portfolio
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 animate-slide-in-left" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Profile Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Unique Portfolio Url</h4>
                    <p className="text-xl text-white font-semibold">{portfolioInfo.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Studio Name</h4>
                    <p className="text-xl text-white font-semibold">{portfolioInfo.studioName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Description</h4>
                    <p className="text-slate-300 leading-relaxed">{portfolioInfo.description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Contact</h4>
                      <p className="text-white">{portfolioInfo.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-pink-400" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Email</h4>
                      <p className="text-white">{portfolioInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Image Card */}
            <div className="bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 animate-slide-in-right" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-xl flex items-center justify-center border border-pink-500/30">
                  <Camera className="w-6 h-6 text-pink-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Cover Image</h2>
              </div>

              {fetchingCoverImage || uploadingCoverImage ? (
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-600 rounded-xl">
                  <LoadingSpinner message={fetchingCoverImage ? "Loading..." : "Uploading..."} />
                </div>
              ) : coverImage ? (
                <div className="space-y-4">
                  <div className="w-full h-48 bg-slate-700 rounded-xl overflow-hidden">
                    <img src={coverImage.url} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center cursor-pointer bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg px-4 py-2 transition-colors border border-slate-600">
                      <Upload className="w-4 h-4 mr-2" />
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadCover}
                        className="hidden"
                        ref={fileInputRef}
                      />
                    </label>
                    <button
                      onClick={handleDeleteCover}
                      className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCover}
                    className="hidden"
                    ref={fileInputRef}
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="flex items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-xl hover:border-slate-500 cursor-pointer transition-colors group"
                  >
                    <div className="text-center">
                      <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3 group-hover:text-slate-300 transition-colors" />
                      <span className="text-slate-300 font-medium">Upload Cover Image</span>
                      <p className="text-slate-500 text-sm mt-1">PNG or JPG, max 2MB</p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Address Card */}
            <div className="bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 animate-slide-in-left" style={{animationDelay: '0.5s'}}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Address</h2>
              </div>
              <div className="space-y-3">
                <p className="text-white font-medium">{portfolioInfo.area}</p>
                <p className="text-slate-300">{portfolioInfo.city}, {portfolioInfo.state}</p>
                <p className="text-slate-300">{portfolioInfo.postalCode}</p>
                <p className="text-slate-400">{portfolioInfo.country}</p>
              </div>
            </div>

            {/* Social Links Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 animate-slide-in-right" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                  <Globe className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Social Media & Links</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "facebookLink", platform: "facebook", name: "Facebook" },
                  { key: "twitterLink", platform: "twitter", name: "Twitter" },
                  { key: "instagramLink", platform: "instagram", name: "Instagram" },
                  { key: "youtubeLink", platform: "youtube", name: "YouTube" },
                  { key: "websiteLink", platform: "website", name: "Website" },
                ].map(({ key, platform, name }) => {
                  const value = portfolioInfo[key as keyof PortfolioDto];
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getSocialIcon(platform)}
                        <span className="font-medium text-white">{name}</span>
                      </div>
                      {value ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 transition-colors"
                        >
                          <span>Visit</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500 text-sm">Not set</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-1/3 right-32 w-32 h-32 bg-pink-500/30 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-48 h-48 bg-cyan-500/30 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-2xl mb-6 animate-float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            {portfolioInfo ? "Update Portfolio" : "Create Portfolio"}
          </h1>
          <p className="text-slate-400 text-lg">Set up your creative portfolio</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 animate-scale-in" style={{animationDelay: '0.2s'}}>
          <form onSubmit={handleSubmit(handlePortfolioInfoSubmit)} className="space-y-6">
            
            {/* General Information */}
            <CollapsibleSection
              title="General Information"
              icon={<User className="w-5 h-5 text-purple-400" />}
              defaultExpanded={true}
              animationDelay="0.3s"
            >
              <div className="space-y-6">
                <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
                  <FormInput
                    label="Unique Portfolio Name"
                    type="text"
                    name="generalInfo.name"
                    placeholder="Enter a unique url route"
                    register={register}
                    error={errors.generalInfo?.name}
                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                      errors.generalInfo?.name ? "border-red-500 animate-shake" : "border-slate-600"
                    }`}
                  />
                </div>


                      <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
                  <FormInput
                    label="Studio Name"
                    type="text"
                    name="generalInfo.studioName"
                    placeholder="Enter your studio name"
                    register={register}
                    error={errors.generalInfo?.studioName}
                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                      errors.generalInfo?.name ? "border-red-500 animate-shake" : "border-slate-600"
                    }`}
                  />
                </div>


                <div className="animate-fade-in" style={{animationDelay: '0.5s'}}>
                  <label className="block text-slate-300 font-medium mb-2">Description</label>
                  <textarea
                    placeholder="Tell us about your studio"
                    {...register("generalInfo.description")}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
                    <FormInput
                      label="Contact"
                      type="text"
                      name="generalInfo.contact"
                      placeholder="Phone number"
                      register={register}
                      error={errors.generalInfo?.contact}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="animate-fade-in" style={{animationDelay: '0.7s'}}>
                    <FormInput
                      label="Email"
                      type="email"
                      name="generalInfo.email"
                      placeholder="Email address"
                      register={register}
                      error={errors.generalInfo?.email}
                      className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                        errors.generalInfo?.email ? "border-red-500 animate-shake" : "border-slate-600"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Address Information */}
            <CollapsibleSection
              title="Address Information"
              icon={<MapPin className="w-5 h-5 text-emerald-400" />}
              defaultExpanded={false}
              animationDelay="0.4s"
            >
              <div className="space-y-4">
                <div className="animate-fade-in" style={{animationDelay: '0.9s'}}>
                  <FormInput
                    label="Area/Neighborhood"
                    type="text"
                    name="generalInfo.address.area"
                    placeholder="Area/Neighborhood"
                    register={register}
                    error={errors.generalInfo?.address?.area}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="animate-fade-in" style={{animationDelay: '1.0s'}}>
                    <FormInput
                      label="City"
                      type="text"
                      name="generalInfo.address.city"
                      placeholder="City"
                      register={register}
                      error={errors.generalInfo?.address?.city}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="animate-fade-in" style={{animationDelay: '1.1s'}}>
                    <FormInput
                      label="State"
                      type="text"
                      name="generalInfo.address.state"
                      placeholder="State"
                      register={register}
                      error={errors.generalInfo?.address?.state}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="animate-fade-in" style={{animationDelay: '1.2s'}}>
                    <FormInput
                      label="Country"
                      type="text"
                      name="generalInfo.address.country"
                      placeholder="Country"
                      register={register}
                      error={errors.generalInfo?.address?.country}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="animate-fade-in" style={{animationDelay: '1.3s'}}>
                    <FormInput
                      label="Postal Code"
                      type="text"
                      name="generalInfo.address.postalCode"
                      placeholder="Postal Code"
                      register={register}
                      error={errors.generalInfo?.address?.postalCode}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Social Links */}
            <CollapsibleSection
              title="Social Media & Links"
              icon={<Globe className="w-5 h-5 text-cyan-400" />}
              defaultExpanded={false}
              animationDelay="0.5s"
            >
              <div className="space-y-6">
                {[
                  { name: "facebookLink", label: "Facebook", placeholder: "https://facebook.com/username", icon: <Facebook className="w-4 h-4" /> },
                  { name: "twitterLink", label: "Twitter", placeholder: "https://twitter.com/username", icon: <Twitter className="w-4 h-4" /> },
                  { name: "instagramLink", label: "Instagram", placeholder: "https://instagram.com/username", icon: <Instagram className="w-4 h-4" /> },
                  { name: "youtubeLink", label: "YouTube", placeholder: "https://youtube.com/username", icon: <Youtube className="w-4 h-4" /> },
                  { name: "websiteLink", label: "Website", placeholder: "https://yourwebsite.com", icon: <Globe className="w-4 h-4" /> },
                ].map((social, index) => (
                  <div key={social.name} className="animate-fade-in" style={{animationDelay: `${0.6 + index * 0.1}s`}}>
                    <label className="flex items-center gap-2 text-slate-300 font-medium mb-2">
                      {social.icon}
                      {social.label}
                    </label>
                    <input
                      type="text"
                      placeholder={social.placeholder}
                      {...register(`socialLinks.${social.name}` as keyof PortfolioInfoFormData)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 animate-fade-in" style={{animationDelay: '1.5s'}}>
              {portfolioInfo && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-8 py-4 text-slate-300 border border-slate-600 rounded-xl hover:bg-slate-700/50 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-xl group"
                >
                  <X className="w-4 h-4 mr-2 inline group-hover:rotate-90 transition-transform duration-300" />
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white rounded-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-2xl group font-semibold"
              >
                <Save className="w-4 h-4 mr-2 inline group-hover:rotate-12 transition-transform duration-300" />
                {portfolioInfo ? "Update Portfolio" : "Create Portfolio"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PortfolioInfo;