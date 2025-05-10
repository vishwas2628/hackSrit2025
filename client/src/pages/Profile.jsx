import React from "react";

const Profile = () => {
  return (
    <form className="flex flex-col h-screen bg-[#212121] p-4 items-center justify-center">
      <div className="w-full max-w-4xl space-y-6  p-6 ">
        <h2 className="text-lg font-semibold text-white text-center border-b border-white/10 pb-4">
          Profile
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="education"
              className="block text-sm font-medium text-white"
            >
              Education Level
            </label>
            <input
              type="text"
              name="education"
              id="education"
              className="w-full mt-1 p-2 bg-[#333333] text-white rounded focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="current-field"
              className="block text-sm font-medium text-white"
            >
              Current Field
            </label>
            <input
              type="text"
              name="current-field"
              id="current-field"
              className="w-full mt-1 p-2 bg-[#333333] text-white rounded focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="interest-field"
              className="block text-sm font-medium text-white"
            >
              Interest Field
            </label>
            <input
              type="text"
              name="interest-field"
              id="interest-field"
              className="w-full mt-1 p-2 bg-[#333333] text-white rounded focus:outline-none focus:ring-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="experience"
              className="block text-sm font-medium text-white"
            >
              Past Experience
            </label>
            <textarea
              name="experience"
              id="experience"
              rows={3}
              className="w-full mt-1 p-2 bg-[#333333] text-white rounded focus:outline-none focus:ring-2"
              placeholder="Write a few sentences about yourself."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-6">
          <div>
            <label
              htmlFor="first-name"
              className="block text-sm font-medium text-white"
            >
              First Name
            </label>
            <input
              type="text"
              name="first-name"
              id="first-name"
              className="w-full mt-1 p-2 bg-[#333333] text-white rounded focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="last-name"
              className="block text-sm font-medium text-white"
            >
              Last Name
            </label>
            <input
              type="text"
              name="last-name"
              id="last-name"
              className="w-full mt-1 p-2 bg-[#333333] text-white rounded focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full mt-1 p-2 bg-[#333333] text-white rounded focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-white"
            >
              Age
            </label>
            <input
              type="number"
              name="age"
              id="age"
              className="w-full mt-1 p-2 bg-[#333333] text-white rounded focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-white"
            >
              Country
            </label>
            <select
              id="country"
              name="country"
              className="w-full mt-1 p-2 bg-[#333333] text-white rounded focus:outline-none focus:ring-2"
            >
              <option>United States</option>
              <option>India</option>
              <option>Japan</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="street-address"
              className="block text-sm font-medium text-white"
            >
              Street Address
            </label>
            <input
              type="text"
              name="street-address"
              id="street-address"
              className="w-full mt-1 p-2 bg-[#333333] text-white rounded focus:outline-none focus:ring-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6 border-t border-white/10 pt-4">
          <button
            type="button"
            className="text-black bg-white px-4 py-2 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
};

export default Profile;