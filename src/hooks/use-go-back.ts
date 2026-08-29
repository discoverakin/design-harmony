import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Go back to wherever the user actually came from.
 *
 * Several pages hard-coded their back button to a fixed route — `HobbyDetail`
 * sent you to `/`, which is how a tester lost a search: results → class →
 * event → back → category list → back → home, with the search gone. Browser
 * history already knows the answer; the only thing it can't answer is the
 * deep-link case, where there is nothing behind this page and `navigate(-1)`
 * would leave the app entirely.
 *
 * `location.key` is the string `"default"` only for the first entry of a
 * session, which is exactly that case — a shared link, a new tab, a refresh.
 */
export function useGoBack(fallback: string) {
  const navigate = useNavigate();
  const { key } = useLocation();

  return useCallback(() => {
    if (key !== "default") {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  }, [key, navigate, fallback]);
}
