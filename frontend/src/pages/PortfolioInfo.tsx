import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { createPortfolio, getPortfolio } from "@/services/DashboardService";
import { PortfolioDto, PortfolioInfoModel } from "../models/Portfolio";

interface CoverFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

const PortfolioInfo: React.FC = () => {
  const [formData, setFormData] = useState<PortfolioInfoModel>({
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
  });

  const [portfolio, setPortfolio] = useState<PortfolioDto | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Cover state and uploading flag
  const [cover, setCover] = useState<CoverFile | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { currentUser } = useSelector(
    (state: {
      user: {
        currentUser: { id: string };
      };
    }) => state.user
  );
  const userId = currentUser.id;

  // Fetch portfolio JSON by userId
  useEffect(() => {
    if (!userId) return;

    const fetchPortfolio = async () => {
      try {
        const data = await getPortfolio(userId);
        setPortfolio(data);
      } catch (err) {
        console.error("Error fetching portfolio:", err);
      }
    };

    fetchPortfolio();
  }, [userId]);

  // Fetch cover for this userId & portfolio.name (if exists)
  const fetchCover = async (portfolioName: string) => {
    if (!portfolioName || !userId) {
      setCover(null);
      return;
    }
    try {
  const res = await fetch(
    `http://localhost:3000/s3/portfoliocover/${encodeURIComponent(portfolioName)}?userId=${encodeURIComponent(userId)}`,
    { credentials: "include" });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      const covers: CoverFile[] = json.covers;
      setCover(covers.length > 0 ? covers[0] : null);
    } catch (err) {
      console.error("Error fetching cover:", err);
      setCover(null);
    }
  };

  // Whenever portfolio is fetched (and has a name), fetch its cover
  useEffect(() => {
    if (portfolio?.name) {
      fetchCover(portfolio.name);
    }
  }, [portfolio]);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    setFormData((prev) => {
      const updated = { ...prev };
      let current: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleEdit = () => {
    if (!portfolio) return;
    setFormData({
      generalInfo: {
        name: portfolio.name || "",
        description: portfolio.description || "",
        contact: portfolio.contact || "",
        email: portfolio.email || "",
        address: {
          area: portfolio.area || "",
          city: portfolio.city || "",
          state: portfolio.state || "",
          country: portfolio.country || "",
          postalCode: portfolio.postalCode || "",
        },
      },
      socialLinks: {
        facebookLink: portfolio.facebookLink || "",
        twitterLink: portfolio.twitterLink || "",
        instagramLink: portfolio.instagramLink || "",
        youtubeLink: portfolio.youtubeLink || "",
        websiteLink: portfolio.websiteLink || "",
      },
    });
    setEditMode(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.generalInfo.name.trim() ||
      !formData.generalInfo.contact.trim() ||
      !formData.generalInfo.email.trim() ||
      !formData.generalInfo.description.trim()
    ) {
      window.alert("Name, Phone, Email, and Description are required.");
      return;
    }

    try {
      // Create or update portfolio on backend
      await createPortfolio({
        userId,
        generalInfo: formData.generalInfo,
        socialLinks: formData.socialLinks,
      } as PortfolioInfoModel);

      // Re-fetch portfolio JSON
      const refreshed = await getPortfolio(userId);
      setPortfolio(refreshed);
      setEditMode(false);
    } catch (err: any) {
      if (
        err.response?.status === 400 &&
        err.response?.data?.message?.includes("already taken")
      ) {
        window.alert("Sorry, that portfolio name is already taken. Please choose another.");
      } else {
        console.error("Error submitting form:", err);
        window.alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Upload cover handler
const handleUploadCover = async () => {
  if (!fileInputRef.current?.files?.[0] || !portfolio?.name) return;
  const file = fileInputRef.current.files[0];
  const formDataFile = new FormData();
  formDataFile.append("file", file); // Changed from "coverImage" to "file"

  try {
    setUploading(true);
 const res = await fetch(
    `http://localhost:3000/s3/uploadportfoliocover/${encodeURIComponent(portfolio.name)}?userId=${encodeURIComponent(userId)}`,
      {
        method: "POST",
        body: formDataFile,
        credentials: "include"
      }
    );
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || `Upload failed (${res.status})`);
      }
      await fetchCover(portfolio.name);
      fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Upload cover error:", err);
      alert("Failed to upload cover: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Delete cover handler
  const handleDeleteCover = async () => {
    if (!cover || !portfolio?.name) return;
    if (!window.confirm("Are you sure you want to delete the cover image?")) return;

    try {
    const res = await fetch(
    `http://localhost:3000/s3/portfoliocover/${encodeURIComponent(portfolio.name)}/${encodeURIComponent(cover.name)}?userId=${encodeURIComponent(userId)}`,
        { method: "DELETE",
          credentials:"include"
         }
      );
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || `Delete failed (${res.status})`);
      }
      setCover(null);
    } catch (err: any) {
      console.error("Delete cover error:", err);
      alert("Failed to delete cover: " + err.message);
    }
  };

  return (
    <div className="">
      {portfolio && !editMode ? (
        <div className="text-black space-y-4">
          <p>
            <strong>Name:</strong> {portfolio.name}
          </p>
          <p>
            <strong>Description:</strong> {portfolio.description}
          </p>
          <p>
            <strong>Contact:</strong> {portfolio.contact}
          </p>
          <p>
            <strong>Email:</strong> {portfolio.email}
          </p>
          <p>
            <strong>Address:</strong>{" "}
            {`${portfolio.area}, ${portfolio.city}, ${portfolio.state}, ${portfolio.country} - ${portfolio.postalCode}`}
          </p>
          <p>
            <strong>Social Links:</strong>
          </p>
          <p>
            <strong>Facebook:</strong> {portfolio.facebookLink}
          </p>
          <p>
            <strong>Twitter:</strong> {portfolio.twitterLink}
          </p>
          <p>
            <strong>Instagram:</strong> {portfolio.instagramLink}
          </p>
          <p>
            <strong>YouTube:</strong> {portfolio.youtubeLink}
          </p>
          <p>
            <strong>Website:</strong> {portfolio.websiteLink}
          </p>

          <div className="flex flex-col space-y-2">
            <button
              onClick={handleEdit}
              className="hover:shadow-form w-full rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white"
            >
              Update Information
            </button>

            <a
              href={`/portfolio/${encodeURIComponent(portfolio.name)}?userId=${encodeURIComponent(userId)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="hover:shadow-form w-full rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white">
                View Portfolio
              </button>
            </a>

            {/* COVER UPLOAD/DELETE SECTION */}
            <div className="pt-4 border-t border-gray-200">
              <p className="font-semibold mb-2">Cover Image</p>

              {cover ? (
                <div className="space-y-2">
                  {/* Preview */}
                  <div className="w-full max-w-sm h-40 bg-gray-100 overflow-hidden rounded-md">
                    <img
                      src={cover.url}
                      alt="Current Cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={handleDeleteCover}
                    className="w-full max-w-sm text-white bg-red-600 hover:bg-red-700 rounded-md py-2"
                  >
                    Delete Cover
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 mb-2">No cover image uploaded yet.</p>
              )}

              <label className="inline-flex items-center max-w-sm w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md cursor-pointer py-2 px-4 mt-2">
                <span>{cover ? "Replace Cover" : "Upload Cover"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  ref={fileInputRef}
                  onChange={() => {
                    if (fileInputRef.current?.files?.[0]) {
                      handleUploadCover();
                    }
                  }}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>
      ) : (
        // EDIT MODE: show form to enter portfolio info
        <div className="flex items-center justify-center p-12">
          <div className="mx-auto w-full max-w-[550px] ">
            <form onSubmit={handleSubmit}>
              {/* Company Name */}
              <div className="mb-5">
                <label
                  htmlFor="name"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  Company Name
                </label>
                <input
                  onChange={handleInfoChange}
                  type="text"
                  required
                  name="generalInfo.name"
                  id="name"
                  value={formData.generalInfo.name}
                  placeholder="Name"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              {/* Description */}
              <div className="mb-5">
                <label
                  htmlFor="description"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  Description
                </label>
                <input
                  onChange={handleInfoChange}
                  type="text"
                  required
                  name="generalInfo.description"
                  id="description"
                  value={formData.generalInfo.description}
                  placeholder="Description"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              {/* Phone */}
              <div className="mb-5">
                <label
                  htmlFor="phone"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  Phone Number
                </label>
                <input
                  onChange={handleInfoChange}
                  type="text"
                  name="generalInfo.contact"
                  id="phone"
                  value={formData.generalInfo.contact}
                  placeholder="Enter your phone number"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              {/* Email */}
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="mb-3 block text-base font-medium text-[#07074D]"
                >
                  Email Address
                </label>
                <input
                  onChange={handleInfoChange}
                  type="email"
                  name="generalInfo.email"
                  id="email"
                  value={formData.generalInfo.email}
                  placeholder="Enter your email"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              {/* Address */}
              <div className="mb-5 pt-3">
                <label className="mb-5 block text-base font-medium text-[#07074D]">
                  Address Details
                </label>
                <div className="-mx-3 flex flex-wrap">
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <input
                        onChange={handleInfoChange}
                        type="text"
                        name="generalInfo.address.area"
                        id="area"
                        value={formData.generalInfo.address.area}
                        placeholder="Enter area"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                    </div>
                  </div>
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <input
                        onChange={handleInfoChange}
                        type="text"
                        name="generalInfo.address.city"
                        id="city"
                        value={formData.generalInfo.address.city}
                        placeholder="Enter city"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                    </div>
                  </div>
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <input
                        onChange={handleInfoChange}
                        type="text"
                        name="generalInfo.address.state"
                        id="state"
                        value={formData.generalInfo.address.state}
                        placeholder="Enter state"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                    </div>
                  </div>
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <input
                        onChange={handleInfoChange}
                        type="text"
                        name="generalInfo.address.country"
                        id="country"
                        value={formData.generalInfo.address.country}
                        placeholder="Enter country"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                    </div>
                  </div>
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <input
                        onChange={handleInfoChange}
                        type="text"
                        name="generalInfo.address.postalCode"
                        id="postalCode"
                        value={formData.generalInfo.address.postalCode}
                        placeholder="Post Code"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mb-5 pt-3">
                <label className="mb-5 block text-base font-medium text-[#07074D]">
                  Social Media Links
                </label>
                <div className="-mx-3 flex flex-wrap">
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <input
                        onChange={handleInfoChange}
                        type="text"
                        name="socialLinks.twitterLink"
                        id="twitter"
                        value={formData.socialLinks.twitterLink}
                        placeholder="Twitter"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                    </div>
                  </div>
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <input
                        onChange={handleInfoChange}
                        type="text"
                        name="socialLinks.facebookLink"
                        id="facebook"
                        value={formData.socialLinks.facebookLink}
                        placeholder="Facebook"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                    </div>
                  </div>
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <input
                        onChange={handleInfoChange}
                        type="text"
                        name="socialLinks.instagramLink"
                        id="instagram"
                        value={formData.socialLinks.instagramLink}
                        placeholder="Instagram"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                    </div>
                  </div>
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <input
                        onChange={handleInfoChange}
                        type="text"
                        name="socialLinks.youtubeLink"
                        id="youtube"
                        value={formData.socialLinks.youtubeLink}
                        placeholder="YouTube"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                    </div>
                  </div>
                  <div className="w-full px-3 sm:w-1/2">
                    <div className="mb-5">
                      <input
                        onChange={handleInfoChange}
                        type="text"
                        name="socialLinks.websiteLink"
                        id="website"
                        value={formData.socialLinks.websiteLink}
                        placeholder="Website"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save / Cancel */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="hover:shadow-form w-full rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white"
                >
                  Save Information
                </button>

                {portfolio && (
                  <button
                    type="button"
                    className="hover:shadow-form w-full rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioInfo;
