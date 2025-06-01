import React, { useEffect, useState } from "react";
import { PortfolioDto, PortfolioInfoModel } from "../models/Portfolio";
import { useSelector } from "react-redux";
import { createPortfolio, getPortfolio } from "@/services/DashboardService";

const PortfolioInfo = () => {
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

  const { currentUser } = useSelector(
    (state: {
      user: {
        currentUser: {
          id: string;
        };
      };
    }) => state.user
  );

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const keys = name.split("."); // Split the nested keys (e.g., "generalInfo.name")

    setFormData((prev) => {
      const updatedFormData = { ...prev };
      let current = updatedFormData;

      // Traverse to the nested property (but not the last one)
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      // Set the value at the last key
      current[keys[keys.length - 1]] = value;
      return updatedFormData;
    });
  };

  // Populate formData with fetched portfolio info for editing
  const handleEdit = () => {
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

  const handlesubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (
        !formData.generalInfo.name ||
        !formData.generalInfo.contact ||
        !formData.generalInfo.email ||
        !formData.generalInfo.description
      ) {
        alert("Name, Phone Number, Email, and Description are required.");
        return;
      }
      await createPortfolio({
        userId: currentUser.id,
        generalInfo: formData.generalInfo,
        socialLinks: formData.socialLinks,
      } as PortfolioInfoModel);

      const portfolio = await getPortfolio(currentUser.id);
      setPortfolio(portfolio);
      setEditMode(false);
    } catch (error) {
      console.error("error submitting form", error);
    }
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const portfolioResponse = await getPortfolio(currentUser.id);
        setPortfolio(portfolioResponse);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }
    };
    if (currentUser?.id) {
      fetchPortfolio();
    }
  }, [currentUser]);

  return (
    <div className="">
      {portfolio && !editMode ? (
        <div className="text-black">
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
            <strong>Facebook:</strong>
            {portfolio.facebookLink}
          </p>
          <p>
            <strong>Twitter:</strong>
            {portfolio.twitterLink}
          </p>
          <p>
            <strong>Insta:</strong>
            {portfolio.instagramLink}
          </p>
          <p>
            <strong>Youtube:</strong>
            {portfolio.youtubeLink}
          </p>
          <p>
            <strong>Website:</strong>
            {portfolio.websiteLink}
          </p>

          <button
            className="hover:shadow-form w-full mt-2 rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none"
            onClick={handleEdit}
          >
            Update Information
          </button>

          <a
            href={`/portfolio/${currentUser.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="hover:shadow-form w-full mt-2 rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none">
              PortFolio
            </button>
          </a>
        </div>
      ) : (
        <div className="flex items-center justify-center p-12">
          <div className="mx-auto w-full max-w-[550px] ">
            <form>
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
                        value={formData.generalInfo.address?.area}
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
                        value={formData.generalInfo.address?.city}
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
                        value={formData.generalInfo.address?.state}
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
                        value={formData.generalInfo.address?.country}
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
                        id="post-code"
                        value={formData.generalInfo.address?.postalCode}
                        placeholder="Post Code"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

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
                        value={formData.socialLinks?.twitterLink}
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
                        value={formData.socialLinks?.facebookLink}
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
                        value={formData.socialLinks?.instagramLink}
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
                        value={formData.socialLinks?.youtubeLink}
                        placeholder="Youtube"
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
                        value={formData.socialLinks?.websiteLink}
                        placeholder="Website"
                        className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* 
            <div className="mb-5">
              <label
                htmlFor="logo"
                className="mb-3 block text-base font-medium text-[#07074D]"
              >
                Upload Logo
              </label>
              <input
                onChange={handleInfoChange}
                id="logo"
                name="logo"
                value={formData.logo}
                type="file"
                className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-teal-500 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-700 focus:outline-none disabled:pointer-events-none disabled:opacity-60"
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="coverImage"
                className="mb-3 block text-base font-medium text-[#07074D]"
              >
                Upload Cover Image
              </label>
              <input
                onChange={handleInfoChange}
                id="coverImage"
                name="coverImage"
                value={formData.coverImage}
                type="file"
                className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-teal-500 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-700 focus:outline-none disabled:pointer-events-none disabled:opacity-60"
              />
            </div> */}

              <div>
                <button
                  className="hover:shadow-form w-full mt-2 rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none"
                  onClick={handlesubmit}
                >
                  Save Information
                </button>

                {portfolio && (
                  <button
                    type="button"
                    className="hover:shadow-form w-full mt-2 rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none"
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
