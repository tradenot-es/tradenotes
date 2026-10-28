import { LegalPage } from "@/components/LegalPage";
import { usePageSeo } from "@/hooks/useSeo";

const Impressum = () => {
  usePageSeo("imprint", "/impressum");
  return <LegalPage page="imprint" showUpdated={false} />;
};

export default Impressum;
