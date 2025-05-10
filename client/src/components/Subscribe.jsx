import React, { useState } from "react";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // Add your subscription logic here
      setSubscribed(true);
    }
  };

  return (
    <div className=" p-4 m-5">
      <div className="w-full max-w-4xl mx-auto">
        {!subscribed ? (
          <>
            <h2 className="text-2xl font-semibold text-white text-center mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Stay updated with the latest news, articles, and resources. We
              promise not to spam your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-500 transition"
              >
                Subscribe
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              Subscribed Successfully!
            </h2>
            <p className="text-sm text-gray-600">
              Thank you for subscribing to our newsletter. Check your inbox for
              updates!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscribe;