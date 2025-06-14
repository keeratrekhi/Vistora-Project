import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  createPortfolio,
  deleteCoverImage,
  fetchCoverImage,
  getPortfolio,
  uploadCoverImage,
} from "@/services/DashboardService";
import { PortfolioDto, PortfolioInfoModel } from "../../models/Portfolio";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/ui/Form/FormInput";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/loading-spinner";

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
  const [fetchingPortfolio, setFetchingPortfolio] = useState<boolean>(false);
  const [fetchingCoverImage, setFetchingCoverImage] = useState<boolean>(false);
  const [uploadingCoverImage, setUploadingCoverImage] =
    useState<boolean>(false);
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

  // Fetch portfolio
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

  // Fetch cover image
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

  // Whenever portfolio is fetched (and has a name), fetch its cover
  useEffect(() => {
    if (portfolioInfo?.name) {
      fetchCover(portfolioInfo.name);
    }
    reset({
      generalInfo: {
        name: portfolioInfo?.name || "",
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
  }, [portfolioInfo]);

  const handlePortfolioInfoSubmit = async (data: PortfolioInfoFormData) => {
    try {
      setUpdatingPortfolio(true);
      // Create or update portfolio on backend
      await createPortfolio({
        userId,
        generalInfo: data.generalInfo,
        socialLinks: data.socialLinks,
      } as PortfolioInfoModel);

      // Re-fetch portfolio JSON
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

  // Upload cover handler
  const handleUploadCover = async () => {
    try {
      setUploadingCoverImage(true);
      if (!fileInputRef.current?.files?.[0] || !portfolioInfo?.name) return;
      const file = fileInputRef.current.files[0];
      const formDataFile = new FormData();
      formDataFile.append("file", file); // Changed from "coverImage" to "file"

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

  // Delete cover handler
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

  if (fetchingPortfolio) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <LoadingSpinner message="Fetching Portfolio..." />
        </div>
      </div>
    );
  }

  if (updatingPortfolio) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <LoadingSpinner message="Updating Portfolio..." />
        </div>
      </div>
    );
  }

  if (portfolioInfo && !showForm) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Portfolio Information
            </h1>
            <div className="flex space-x-3">
              <button
                onClick={handleUpdateInfo}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 "
              >
                Update Info
              </button>
              <a
                href={`/portfolio/${encodeURIComponent(
                  portfolioInfo.name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-blue-100 text-black px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 ">
                  <ExternalLink className="w-4 h-4" />
                  <span>View Portfolio</span>
                </button>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-600 mb-1 uppercase tracking-wide">
                        Name
                      </h4>
                      <p className="text-lg text-slate-800">
                        {portfolioInfo.name}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-600 mb-1 uppercase tracking-wide">
                        Description
                      </h4>
                      <p className="text-slate-700 leading-relaxed">
                        {portfolioInfo.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                          Contact
                        </h4>
                        <p className="text-slate-800">
                          {portfolioInfo.contact}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                          Email
                        </h4>
                        <p className="text-slate-800">{portfolioInfo.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span>Cover Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fetchingCoverImage || uploadingCoverImage ? (
                  <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-400">
                    {fetchingCoverImage && (
                      <LoadingSpinner message="Fetching cover image..." />
                    )}
                    {uploadingCoverImage && (
                      <LoadingSpinner message="Updating cover image..." />
                    )}
                  </div>
                ) : coverImage ? (
                  <div className="space-y-3">
                    <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                      <img
                        src={coverImage.url}
                        alt="Current Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <label
                        htmlFor="cover-upload"
                        className="flex-1 flex items-center justify-center cursor-pointer border border-gray-300 rounded-lg px-3 py-1 bg-white hover:bg-blue-200 transition-colors"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={handleUploadCover}
                          className="hidden"
                          id="cover-upload"
                          ref={fileInputRef}
                        />
                      </label>
                      <Button
                        onClick={handleDeleteCover}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleUploadCover}
                      className="hidden"
                      ref={fileInputRef}
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600 font-medium">
                          Upload Cover Image
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG or JPG, max 2MB
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-slate-800">{portfolioInfo.area}</p>
                  <p className="text-slate-700">
                    {portfolioInfo.city}, {portfolioInfo.state}
                  </p>
                  <p className="text-slate-700">{portfolioInfo.postalCode}</p>
                  <p className="text-slate-600">{portfolioInfo.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Social Links Card */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span>Social Media & Links</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "facebookLink",
                    "twitterLink",
                    "instagramLink",
                    "youtubeLink",
                    "websiteLink",
                  ].map((key) => {
                    const value = portfolioInfo[key];
                    const platform = key.replace("Link", "");
                    const displayName =
                      platform.charAt(0).toUpperCase() + platform.slice(1);

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getSocialIcon(platform)}
                          <span className="font-bold text-slate-700">
                            {displayName}
                          </span>
                        </div>
                        {value ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm truncate max-w-32 flex items-center space-x-1"
                          >
                            <span>Visit</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-sm">
                            Not set
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-5">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6 ">
          {portfolioInfo
            ? "Update Portfolio Information"
            : "Portfolio Information"}
        </h1>

        <form
          onSubmit={handleSubmit(handlePortfolioInfoSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-4 ">
                  General Information
                </h3>

                <div className="space-y-4">
                  <FormInput
                    label="Name"
                    type="text"
                    name="generalInfo.name"
                    placeholder="Enter studio name"
                    register={register}
                    error={errors.generalInfo?.name}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.generalInfo?.name
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />

                  <FormInput
                    label="Description"
                    type="textarea"
                    name="generalInfo.description"
                    placeholder="Enter studio description"
                    register={register}
                    error={errors.generalInfo?.description}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.generalInfo?.description
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />

                  <FormInput
                    label="Contact"
                    type="text"
                    name="generalInfo.contact"
                    placeholder="Enter contact number"
                    register={register}
                    error={errors.generalInfo?.contact}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.generalInfo?.contact
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />

                  <FormInput
                    label="Email"
                    type="email"
                    name="generalInfo.email"
                    placeholder="Enter email address"
                    register={register}
                    error={errors.generalInfo?.email}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.generalInfo?.email
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-4 ">
                  Address
                </h3>

                <div className="space-y-4">
                  <FormInput
                    label="Area"
                    type="text"
                    name="generalInfo.address.area"
                    placeholder="Enter area"
                    register={register}
                    error={errors.generalInfo?.address?.area}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.generalInfo?.address?.area
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="">
                      <FormInput
                        label="City"
                        type="text"
                        name="generalInfo.address.city"
                        placeholder="Enter city"
                        register={register}
                        error={errors.generalInfo?.address?.city}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.generalInfo?.address?.city
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />

                      <FormInput
                        label="Country"
                        type="text"
                        name="generalInfo.address.country"
                        placeholder="Enter country"
                        register={register}
                        error={errors.generalInfo?.address?.country}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.generalInfo?.address?.country
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                    </div>

                    <div>
                      <FormInput
                        label="State"
                        type="text"
                        name="generalInfo.address.state"
                        placeholder="Enter state"
                        register={register}
                        error={errors.generalInfo?.address?.state}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.generalInfo?.address?.state
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />

                      <FormInput
                        label="Postal Code"
                        type="text"
                        name="generalInfo.address.postalCode"
                        placeholder="Enter postal code"
                        register={register}
                        error={errors.generalInfo?.address?.postalCode}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.generalInfo?.address?.postalCode
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-4 ">
                  Social Links
                </h3>

                <div className="space-y-4">
                  <FormInput
                    label="Facebook"
                    type="text"
                    name="socialLinks.facebookLink"
                    placeholder="https://facebook.com/username"
                    register={register}
                    error={errors.socialLinks?.facebookLink}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.socialLinks?.facebookLink
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />

                  <FormInput
                    label="Twitter"
                    type="text"
                    name="socialLinks.twitterLink"
                    placeholder="https://twitter.com/username"
                    register={register}
                    error={errors.socialLinks?.twitterLink}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.socialLinks?.twitterLink
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />

                  <FormInput
                    label="Instagram"
                    type="text"
                    name="socialLinks.instagramLink"
                    placeholder="https://instagram.com/username"
                    register={register}
                    error={errors.socialLinks?.instagramLink}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.socialLinks?.instagramLink
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />

                  <FormInput
                    label="YouTube"
                    type="text"
                    name="socialLinks.youtubeLink"
                    placeholder="https://youtube.com/username"
                    register={register}
                    error={errors.socialLinks?.youtubeLink}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.socialLinks?.youtubeLink
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />

                  <FormInput
                    label="Website"
                    type="text"
                    name="socialLinks.websiteLink"
                    placeholder="https://website.com"
                    register={register}
                    error={errors.socialLinks?.websiteLink}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.socialLinks?.websiteLink
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                </div>
              </div>

              {/* <div>
                <h3 className="text-lg font-medium text-slate-800 mb-4 ">
                  Cover Image
                </h3>
                {coverImage ? (
                  <div className="space-y-3">
                    <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                      <img
                        src={coverImage.url}
                        alt="Current Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <label
                        htmlFor="cover-upload"
                        className="flex-1 flex items-center justify-center cursor-pointer border border-gray-300 rounded-lg px-3 py-1 bg-white hover:bg-blue-200 transition-colors"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={handleUploadCover}
                          className="hidden"
                          id="cover-upload"
                          ref={fileInputRef}
                        />
                      </label>
                      <Button
                        onClick={handleDeleteCover}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleUploadCover}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600 font-medium">
                          Upload Cover Image
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG or JPG, max 2MB
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div> */}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
              className=""
            >
              Cancel
            </Button>
            <Button type="submit" className="">
              Save Information
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
  // return (
  //   <div className="">
  //     {portfolio && !editMode ? (
  //       <div className="text-black space-y-4">
  //         <p>
  //           <strong>Name:</strong> {portfolio.name}
  //         </p>
  //         <p>
  //           <strong>Description:</strong> {portfolio.description}
  //         </p>
  //         <p>
  //           <strong>Contact:</strong> {portfolio.contact}
  //         </p>
  //         <p>
  //           <strong>Email:</strong> {portfolio.email}
  //         </p>
  //         <p>
  //           <strong>Address:</strong>{" "}
  //           {`${portfolio.area}, ${portfolio.city}, ${portfolio.state}, ${portfolio.country} - ${portfolio.postalCode}`}
  //         </p>
  //         <p>
  //           <strong>Social Links:</strong>
  //         </p>
  //         <p>
  //           <strong>Facebook:</strong> {portfolio.facebookLink}
  //         </p>
  //         <p>
  //           <strong>Twitter:</strong> {portfolio.twitterLink}
  //         </p>
  //         <p>
  //           <strong>Instagram:</strong> {portfolio.instagramLink}
  //         </p>
  //         <p>
  //           <strong>YouTube:</strong> {portfolio.youtubeLink}
  //         </p>
  //         <p>
  //           <strong>Website:</strong> {portfolio.websiteLink}
  //         </p>

  //         <div className="flex flex-col space-y-2">
  //           <button
  //             onClick={handleEdit}
  //             className="hover:shadow-form w-full rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white"
  //           >
  //             Update Information
  //           </button>

  //           <a
  //             href={`/portfolio/${encodeURIComponent(
  //               portfolio.name
  //             )}?userId=${encodeURIComponent(userId)}`}
  //             target="_blank"
  //             rel="noopener noreferrer"
  //           >
  //             <button className="hover:shadow-form w-full rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white">
  //               View Portfolio
  //             </button>
  //           </a>

  //           {/* COVER UPLOAD/DELETE SECTION */}
  //           <div className="pt-4 border-t border-gray-200">
  //             <p className="font-semibold mb-2">Cover Image</p>

  //             {cover ? (
  //               <div className="space-y-2">
  //                 {/* Preview */}
  //                 <div className="w-full max-w-sm h-40 bg-gray-100 overflow-hidden rounded-md">
  //                   <img
  //                     src={cover.url}
  //                     alt="Current Cover"
  //                     className="w-full h-full object-cover"
  //                   />1
  //                 </div>
  //                 <button
  //                   onClick={handleDeleteCover}
  //                   className="w-full max-w-sm text-white bg-red-600 hover:bg-red-700 rounded-md py-2"
  //                 >
  //                   Delete Cover
  //                 </button>
  //               </div>
  //             ) : (
  //               <p className="text-gray-500 mb-2">
  //                 No cover image uploaded yet.
  //               </p>
  //             )}

  //             <label className="inline-flex items-center max-w-sm w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md cursor-pointer py-2 px-4 mt-2">
  //               <span>{cover ? "Replace Cover" : "Upload Cover"}</span>
  //               <input
  //                 type="file"
  //                 accept="image/*"
  //                 className="sr-only"
  //                 ref={fileInputRef}
  //                 onChange={() => {
  //                   if (fileInputRef.current?.files?.[0]) {
  //                     handleUploadCover();
  //                   }
  //                 }}
  //                 disabled={uploading}
  //               />
  //             </label>
  //           </div>
  //         </div>
  //       </div>
  //     ) : (
  //       // EDIT MODE: show form to enter portfolio info
  //       <div className="flex items-center justify-center p-12">
  //         <div className="mx-auto w-full max-w-[550px] ">
  //           <form onSubmit={handleSubmit(handlePortfolioInfoSubmit)}>
  //             {/* Company Name */}
  //             <div className="mb-5">
  //               <label
  //                 htmlFor="name"
  //                 className="mb-3 block text-base font-medium text-[#07074D]"
  //               >
  //                 Company Name
  //               </label>
  //               <input
  //                 onChange={handleInfoChange}
  //                 type="text"
  //                 required
  //                 name="generalInfo.name"
  //                 id="name"
  //                 value={formData.generalInfo.name}
  //                 placeholder="Name"
  //                 className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //               />
  //             </div>

  //             {/* Description */}
  //             <div className="mb-5">
  //               <label
  //                 htmlFor="description"
  //                 className="mb-3 block text-base font-medium text-[#07074D]"
  //               >
  //                 Description
  //               </label>
  //               <input
  //                 onChange={handleInfoChange}
  //                 type="text"
  //                 required
  //                 name="generalInfo.description"
  //                 id="description"
  //                 value={formData.generalInfo.description}
  //                 placeholder="Description"
  //                 className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //               />
  //             </div>

  //             {/* Phone */}
  //             <div className="mb-5">
  //               <label
  //                 htmlFor="phone"
  //                 className="mb-3 block text-base font-medium text-[#07074D]"
  //               >
  //                 Phone Number
  //               </label>
  //               <input
  //                 onChange={handleInfoChange}
  //                 type="text"
  //                 name="generalInfo.contact"
  //                 id="phone"
  //                 value={formData.generalInfo.contact}
  //                 placeholder="Enter your phone number"
  //                 className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //               />
  //             </div>

  //             {/* Email */}
  //             <div className="mb-5">
  //               <label
  //                 htmlFor="email"
  //                 className="mb-3 block text-base font-medium text-[#07074D]"
  //               >
  //                 Email Address
  //               </label>
  //               <input
  //                 onChange={handleInfoChange}
  //                 type="email"
  //                 name="generalInfo.email"
  //                 id="email"
  //                 value={formData.generalInfo.email}
  //                 placeholder="Enter your email"
  //                 className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //               />
  //             </div>

  //             {/* Address */}
  //             <div className="mb-5 pt-3">
  //               <label className="mb-5 block text-base font-medium text-[#07074D]">
  //                 Address Details
  //               </label>
  //               <div className="-mx-3 flex flex-wrap">
  //                 <div className="w-full px-3 sm:w-1/2">
  //                   <div className="mb-5">
  //                     <input
  //                       onChange={handleInfoChange}
  //                       type="text"
  //                       name="generalInfo.address.area"
  //                       id="area"
  //                       value={formData.generalInfo.address.area}
  //                       placeholder="Enter area"
  //                       className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="w-full px-3 sm:w-1/2">
  //                   <div className="mb-5">
  //                     <input
  //                       onChange={handleInfoChange}
  //                       type="text"
  //                       name="generalInfo.address.city"
  //                       id="city"
  //                       value={formData.generalInfo.address.city}
  //                       placeholder="Enter city"
  //                       className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="w-full px-3 sm:w-1/2">
  //                   <div className="mb-5">
  //                     <input
  //                       onChange={handleInfoChange}
  //                       type="text"
  //                       name="generalInfo.address.state"
  //                       id="state"
  //                       value={formData.generalInfo.address.state}
  //                       placeholder="Enter state"
  //                       className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="w-full px-3 sm:w-1/2">
  //                   <div className="mb-5">
  //                     <input
  //                       onChange={handleInfoChange}
  //                       type="text"
  //                       name="generalInfo.address.country"
  //                       id="country"
  //                       value={formData.generalInfo.address.country}
  //                       placeholder="Enter country"
  //                       className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="w-full px-3 sm:w-1/2">
  //                   <div className="mb-5">
  //                     <input
  //                       onChange={handleInfoChange}
  //                       type="text"
  //                       name="generalInfo.address.postalCode"
  //                       id="postalCode"
  //                       value={formData.generalInfo.address.postalCode}
  //                       placeholder="Post Code"
  //                       className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //                     />
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>

  //             {/* Social Links */}
  //             <div className="mb-5 pt-3">
  //               <label className="mb-5 block text-base font-medium text-[#07074D]">
  //                 Social Media Links
  //               </label>
  //               <div className="-mx-3 flex flex-wrap">
  //                 <div className="w-full px-3 sm:w-1/2">
  //                   <div className="mb-5">
  //                     <input
  //                       onChange={handleInfoChange}
  //                       type="text"
  //                       name="socialLinks.twitterLink"
  //                       id="twitter"
  //                       value={formData.socialLinks.twitterLink}
  //                       placeholder="Twitter"
  //                       className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="w-full px-3 sm:w-1/2">
  //                   <div className="mb-5">
  //                     <input
  //                       onChange={handleInfoChange}
  //                       type="text"
  //                       name="socialLinks.facebookLink"
  //                       id="facebook"
  //                       value={formData.socialLinks.facebookLink}
  //                       placeholder="Facebook"
  //                       className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="w-full px-3 sm:w-1/2">
  //                   <div className="mb-5">
  //                     <input
  //                       onChange={handleInfoChange}
  //                       type="text"
  //                       name="socialLinks.instagramLink"
  //                       id="instagram"
  //                       value={formData.socialLinks.instagramLink}
  //                       placeholder="Instagram"
  //                       className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="w-full px-3 sm:w-1/2">
  //                   <div className="mb-5">
  //                     <input
  //                       onChange={handleInfoChange}
  //                       type="text"
  //                       name="socialLinks.youtubeLink"
  //                       id="youtube"
  //                       value={formData.socialLinks.youtubeLink}
  //                       placeholder="YouTube"
  //                       className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="w-full px-3 sm:w-1/2">
  //                   <div className="mb-5">
  //                     <input
  //                       onChange={handleInfoChange}
  //                       type="text"
  //                       name="socialLinks.websiteLink"
  //                       id="website"
  //                       value={formData.socialLinks.websiteLink}
  //                       placeholder="Website"
  //                       className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  //                     />
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>

  //             {/* Save / Cancel */}
  //             <div className="flex space-x-4">
  //               <button
  //                 type="submit"
  //                 className="hover:shadow-form w-full rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white"
  //               >
  //                 Save Information
  //               </button>

  //               {portfolio && (
  //                 <button
  //                   type="button"
  //                   className="hover:shadow-form w-full rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white"
  //                   onClick={() => setEditMode(false)}
  //                 >
  //                   Cancel
  //                 </button>
  //               )}
  //             </div>
  //           </form>
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // );
};

export default PortfolioInfo;
