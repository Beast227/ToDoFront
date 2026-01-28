// hooks/useCategories.ts
import useSWR from "swr";
import { todocat } from "@/types/Types";

const fetcher = (url: string) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());
};

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<todocat[]>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/todo/category`,
    fetcher,
    {
      revalidateOnFocus: false, // Optional: Stop re-fetching when clicking window
      dedupingInterval: 60000,  // Cache for 1 minute
    }
  );

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate, // This function lets us manually refresh the cache (e.g. after adding)
  };
}