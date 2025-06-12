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
    <div className="w-full py-12 h-screen sm:py-16 flex items-center justify-center bg-gray-900 dark:bg-gray-950">
      <div className="w-full max-w-3xl mx-auto px-6 sm:px-8 text-center text-white">
        {!subscribed ? (
          <>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight dark:text-white">
              Subscribe to Our Newsletter
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-blue-200 max-w-2xl mx-auto dark:text-blue-300">
              Stay ahead with cutting-edge insights, career tips, and AI-driven
              resources. No spam, just value.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center"
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 p-3 rounded-full border-2 border-blue-400 bg-gray-800/50 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full dark:border-blue-500 dark:bg-gray-900 dark:placeholder-blue-300"
                required
              />
              <button
                type="submit"
                className="font-bold text-lg px-8 py-3 border-2 border-blue-400 rounded-full bg-gray-800/50 text-white hover:bg-blue-700 hover:border-blue-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 dark:border-blue-500 dark:hover:bg-blue-600"
              >
                Subscribe
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-blue-300 dark:text-blue-400">
              Subscribed Successfully!
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-blue-200 max-w-2xl mx-auto dark:text-blue-300">
              Thank you for joining us! Expect exciting updates in your inbox
              soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscribe;
