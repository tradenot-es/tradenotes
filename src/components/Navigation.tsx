import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/tradenotes-logo.png";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <img src={logo} alt="TradeNotes" className="h-8 w-8" />
            <span>TradeNotes</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary smooth-transition">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary smooth-transition">
              Pricing
            </a>
            <Link to="/auth" className="text-sm font-medium hover:text-primary smooth-transition">
              Login
            </Link>
          </div>
          
          <Button variant="premium" asChild className="hidden md:inline-flex">
            <Link to="/auth">Jetzt starten</Link>
          </Button>

          {/* Mobile Button */}
          <Button variant="premium" size="sm" asChild className="md:hidden">
            <Link to="/auth">Start</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};
