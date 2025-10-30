import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, MessageSquare, Sparkles, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  { icon: TrendingUp, key: "bestDay", de: "Was war mein bester Trading-Tag?", en: "What was my best trading day?" },
  { icon: BarChart3, key: "topSymbol", de: "Mit welchem Symbol hatte ich die besten Trades?", en: "Which symbol had my best trades?" },
  { icon: Calendar, key: "weekPerformance", de: "Wie war meine Performance diese Woche?", en: "How was my performance this week?" },
  { icon: Sparkles, key: "topSetup", de: "Was ist mein profitabelstes Setup?", en: "What's my most profitable setup?" },
];

export const TradingAssistant = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('trading-assistant', {
        body: { question, timeframe: 'all' }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling assistant:', error);
      toast({
        title: t("assistant.error"),
        description: t("assistant.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("assistant.title")}</h1>
        <p className="text-muted-foreground">{t("assistant.subtitle")}</p>
      </div>

      <Card className="flex-1 flex flex-col p-6">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t("assistant.welcome")}</h3>
                <p className="text-muted-foreground">{t("assistant.welcomeDescription")}</p>
              </div>
            </div>

            <div className="w-full max-w-2xl">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">{t("assistant.suggestedQuestions")}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <Button
                    key={q.key}
                    variant="outline"
                    className="h-auto py-4 px-4 justify-start text-left"
                    onClick={() => handleSuggestedQuestion(i18n.language === 'de' ? q.de : q.en)}
                  >
                    <q.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="text-sm">{i18n.language === 'de' ? q.de : q.en}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString(i18n.language, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder={t("assistant.inputPlaceholder")}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
