import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS_DE = [
  "Was war mein bester Trading-Tag?",
  "Welches Symbol hatte meine besten Trades?",
  "Wie war meine Performance diese Woche?",
  "Was ist mein profitabelstes Setup?",
];

const SUGGESTED_QUESTIONS_EN = [
  "What was my best trading day?",
  "Which symbol had my best trades?",
  "How was my performance this week?",
  "What's my most profitable setup?",
];

export const AIAssistantFAB = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionsRemaining, setQuestionsRemaining] = useState<number | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const [tier, setTier] = useState<string>('free');

  const suggestedQuestions = i18n.language === 'de' ? SUGGESTED_QUESTIONS_DE : SUGGESTED_QUESTIONS_EN;

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

      if (error) {
        // Check for specific error types
        if (error.message?.includes('402') || error.message?.includes('credits') || error.message?.includes('payment')) {
          throw new Error(t("assistant.creditsExhausted"));
        }
        if (error.message?.includes('429') || error.message?.includes('Daily limit')) {
          throw new Error(t("assistant.dailyLimitReached"));
        }
        throw error;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update remaining questions
      if (data.questionsRemaining !== undefined) {
        setQuestionsRemaining(data.questionsRemaining);
        setDailyLimit(data.dailyLimit);
        setTier(data.tier);
      }
    } catch (error) {
      console.error('Error calling assistant:', error);
      toast({
        title: t("assistant.error"),
        description: error instanceof Error ? error.message : t("assistant.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          aria-label={t("assistant.title")}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Dialog */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {t("assistant.title")}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Usage indicator */}
            {questionsRemaining !== null && dailyLimit !== null && (
              <div className="mb-3 p-2 bg-muted rounded-lg text-xs text-muted-foreground text-center">
                {questionsRemaining} / {dailyLimit} {t("assistant.questionsRemaining")}
                {tier === 'free' && questionsRemaining <= 2 && (
                  <span className="block mt-1 text-primary font-medium">
                    {t("assistant.upgradeForMore")}
                  </span>
                )}
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">{t("assistant.welcome")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("assistant.welcomeDescription")}
                  </p>
                </div>

                <div className="w-full space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("assistant.suggestedQuestions")}
                  </p>
                  {suggestedQuestions.map((q, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full h-auto py-2 px-3 text-left text-sm justify-start"
                      onClick={() => sendMessage(q)}
                    >
                      {q}
                    </Button>
                  ))}
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
                          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
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
                      <div className="bg-muted rounded-lg px-3 py-2">
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
          </CardContent>
        </Card>
      )}
    </>
  );
};
