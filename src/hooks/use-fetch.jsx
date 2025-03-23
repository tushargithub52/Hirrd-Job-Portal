import { useSession } from "@clerk/clerk-react";
import { useState } from "react";

const useFetch = (cb, options = {}) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { session } = useSession();

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      if (!session) {
        throw new Error("Session is not available. Ensure the user is logged in.");
      }

      if (typeof session.getToken !== "function") {
        throw new Error("session.getToken is not a function.");
      }

      const supabaseAccessToken = await session.getToken({
        template: "supabase",
      });

      if (!supabaseAccessToken) {
        throw new Error("Failed to retrieve Supabase access token.");
      }

      console.log("Fetching data with options:", options, "and args:", args);

      const response = await cb(supabaseAccessToken, options, ...args);
      console.log("API response:", response);

      setData(response);
    } catch (err) {
      console.error("Error in useFetch:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn };
};

export default useFetch;
