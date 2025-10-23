import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddTradeFABProps {
  onClick: () => void;
}

export function AddTradeFAB({ onClick }: AddTradeFABProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
