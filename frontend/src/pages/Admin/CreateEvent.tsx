import { ADMIN_EVENTS_ROUTE, CREATE_EVENT_ROUTE } from "@/constants/RouteContant";
import { AccessType } from "@/enums/AccessType";
import { CreateEventModel } from "@/models/Event";
import { createEvent } from "@/services/EventsService";
import DateWrapper from "@/utils/DateUtil";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";

const eventInfo: CreateEventModel = {
  title: "",
  description: "",
  eventDate: new DateWrapper(new Date()),
  location: "",
  coverImage: "",
  isPublished: true,
  accessType: AccessType.Public,
};

export const CreateEvent = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector(
    (state: {
      user: {
        currentUser: {
          id: string;
          username: string;
        };
      };
    }) => state.user
  );
  const [info, setInfo] = useState<CreateEventModel>(eventInfo);

  const handleInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInfo((prevInfo: any) => updateModel(prevInfo, name, value));
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    // Wrap the selected date in a DateWrapper instance
    const wrappedDate = new DateWrapper(value);

    setInfo((prevInfo) => ({
      ...prevInfo,
      [name]: wrappedDate,
    }));
  };

  function updateModel(
    model: CreateEventModel,
    path: string,
    value: any
  ): CreateEventModel {
    const updatedModel = { ...model }; // Create shallow copy

    const parts = path.split(".");
    let current: any = updatedModel;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (typeof current[part] === "object" && current[part] !== null) {
        current = current[part] = { ...current[part] }; //create a shallow copy of the object at each level to avoid mutating original model.
      } else {
        console.error(`Invalid path: ${path}`);
        return updatedModel; // Return the model without changes if path is invalid
      }
    }

    const lastPart = parts[parts.length - 1];
    if (lastPart in current) {
      current[lastPart] = value;
    } else {
      console.error(`Invalid path: ${path}`);
      return updatedModel; // Return the model without changes if path is invalid
    }

    return updatedModel;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await createEvent(info, currentUser.id);
      navigate(ADMIN_EVENTS_ROUTE);
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  return (
    <div className="flex items-center justify-center p-12">
      <div className="mx-auto w-full max-w-[550px] ">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-5">
            <label
              htmlFor="title"
              className="mb-3 block text-base font-medium text-[#07074D]"
            >
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              onChange={handleInfoChange}
              type="text"
              name="title"
              id="title"
              value={info.title}
              placeholder="Enter event title"
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              required
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
              name="description"
              id="description"
              value={info.description}
              placeholder="Enter event description"
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
            />
          </div>

          {/* Event Date */}
          <div className="mb-5">
            <label
              htmlFor="eventDate"
              className="mb-3 block text-base font-medium text-[#07074D]"
            >
              Event Date
            </label>
            <input
              onChange={handleDateChange}
              type="date"
              name="eventDate"
              id="eventDate"
              value={info.eventDate.getDisplayFormat("YYYY-MM-DD")}
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
            />
          </div>

          {/* Location */}
          <div className="mb-5">
            <label
              htmlFor="location"
              className="mb-3 block text-base font-medium text-[#07074D]"
            >
              Location
            </label>
            <input
              onChange={handleInfoChange}
              type="text"
              name="location"
              id="location"
              value={info.location}
              placeholder="Enter event location"
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
            />
          </div>

          {/* TODO : implement image upload */}
          {/* Cover Image */}
          {/* <div className="mb-5">
            <label
              htmlFor="coverImage"
              className="mb-3 block text-base font-medium text-[#07074D]"
            >
              Upload Cover Image
            </label>
            <input
              onChange={handleInfoChange}
              type="file"
              name="coverImage"
              id="coverImage"
              className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-teal-500 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-700 focus:outline-none disabled:pointer-events-none disabled:opacity-60"
            />
          </div> */}

          {/* Is Published */}
          {/* <div className="mb-5">
            <label htmlFor="isPublished" className="mb-3 block text-base font-medium text-[#07074D]">
              Is Published
            </label>
            <input
              onChange={handleInfoChange}
              type="checkbox"
              name="isPublished"
              id="isPublished"
              checked={eventInfo.isPublished}
              className="mr-2"
            />
            <span>Published</span>
          </div> */}

          {/* Access Type */}
          {/* <div className="mb-5">
            <label htmlFor="accessType" className="mb-3 block text-base font-medium text-[#07074D]">
              Access Type
            </label>
            <select
              onChange={handleInfoChange}
              name="accessType"
              id="accessType"
              value={eventInfo.accessType}
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div> */}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="hover:shadow-form w-full mt-2 rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
