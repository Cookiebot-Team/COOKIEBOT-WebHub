import { Metadata } from "next";
import NotFoundContent from "./NotFoundContent";

export const metadata: Metadata = {
    title: "404 Not Found"
};

// Translated client-side (the site is a static export; see LocaleProvider).
export default function NotFound() {
    return <NotFoundContent />;
}
