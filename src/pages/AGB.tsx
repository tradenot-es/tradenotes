import { LegalPage } from "@/components/LegalPage";
import { usePageSeo } from "@/hooks/useSeo";

const AGB = () => {
  usePageSeo("terms", "/agb");
  return <LegalPage page="terms" />;
};

export default AGB;
