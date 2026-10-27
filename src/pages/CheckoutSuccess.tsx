import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";
import logo from "@/assets/logo.webp";
import { usePageSeo } from "@/hooks/useSeo";

export default function CheckoutSuccess() {
  usePageSeo("checkout", "/checkout-success", { noindex: true });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Fire confetti on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Big burst at start
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899"],
    });
  }, []);

  useEffect(() => {
    // Countdown timer for redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center animate-scale-in">
        <CardHeader className="pb-4">
          <div className="flex flex-col items-center mb-4">
            <img src={logo} alt="TradeNotes" className="h-10 w-auto mb-4" />
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              <CheckCircle className="h-20 w-20 text-green-500 relative z-10" />
            </div>
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            {t("checkout.successTitle")}
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {t("checkout.successDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("checkout.premiumActivated")}
            </p>
            <ul className="text-sm text-left space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                {t("checkout.feature1")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                {t("checkout.feature2")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                {t("checkout.feature3")}
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full"
              size="lg"
            >
              {t("checkout.goToDashboard")}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t("checkout.redirecting", { seconds: countdown })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
