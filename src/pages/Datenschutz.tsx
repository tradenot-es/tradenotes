import { LegalPage } from "@/components/LegalPage";
import { usePageSeo } from "@/hooks/useSeo";

const Datenschutz = () => {
  usePageSeo("privacy", "/datenschutz");
  return <LegalPage page="privacy" />;
};

export default Datenschutz;
