import { useCallback } from "react";
import { useRouter } from "next/navigation";

export const useRouterPush = () => {
  const router = useRouter();

  const application = useCallback(() => {
    router.push("/");
  }, [router]);

  const login = useCallback(() => {
    router.push("/login");
  }, [router]);

  return {
    application,
    login,
  };
};
