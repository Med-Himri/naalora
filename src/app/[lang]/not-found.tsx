import { getDictionary } from "@/lib/i18n";
import NotFoundContent from "@/components/NotFoundContent";

// not-found.tsx receives no params: both languages' short texts go to a tiny client
// component that picks the right one from the URL.
export default function NotFound() {
  return <NotFoundContent texts={{ fr: getDictionary("fr").notFound, ar: getDictionary("ar").notFound }} />;
}
