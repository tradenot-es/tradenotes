import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, BookOpen, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { DailyPrep } from "@/components/DailyPrep";
import { PageHeader } from "@/components/PageHeader";

interface JournalEntry {
  id: string;
  date: string;
  content: string;
}

const JOURNAL_TEMPLATES = ["premarket", "recap", "lossReview"] as const;

const Journal = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [charCount, setCharCount] = useState(0);

  const journalSchema = z.object({
    content: z.string()
      .trim()
      .min(1, { message: t("validation.journalContentRequired") })
      .max(10000, { message: t("validation.journalContentTooLong") })
  });

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    const { data, error } = await db
      .from("journal_entries")
      .select("id, date, content")
      .order("date", { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const applyTemplate = (key: (typeof JOURNAL_TEMPLATES)[number]) => {
    const body = t(`journalTemplates.${key}.body`);
    const next = newEntry.trim() ? `${newEntry.trimEnd()}\n\n${body}` : body;
    setNewEntry(next);
    setCharCount(next.length);
    setError("");
  };

  const handleAddEntry = async () => {
    setError("");

    // Validate input
    const validation = journalSchema.safeParse({ content: newEntry });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      const currentUser = user;
      if (!currentUser) throw new Error(t("journal.notLoggedIn"));

      const { error } = await db.from("journal_entries").insert({
        user_id: currentUser.id,
        date: new Date().toISOString().split("T")[0],
        content: newEntry,
      });

      if (error) throw error;

      toast.success(t("journal.entryAdded"));
      setNewEntry("");
      setCharCount(0);
      loadEntries();
    } catch (error: any) {
      toast.error(error.message || t("journal.addError"));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("journal.title")}
        subtitle={t("journal.subtitle")}
      />

      <Tabs defaultValue="prep" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prep" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t("journal.dailyPrep")}
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t("journal.journalEntries")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prep">
          <DailyPrep />
        </TabsContent>

        <TabsContent value="journal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("journal.newEntry")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* templates fill (or extend) the entry with a structure to answer */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("journalTemplates.label")}</span>
                {JOURNAL_TEMPLATES.map((key) => (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 active:scale-95 transition-transform"
                    onClick={() => applyTemplate(key)}
                  >
                    <LayoutTemplate className="h-3.5 w-3.5" aria-hidden />
                    {t(`journalTemplates.${key}.title`)}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder={t("journal.placeholder")}
                  value={newEntry}
                  onChange={(e) => {
                    setNewEntry(e.target.value);
                    setCharCount(e.target.value.length);
                    setError("");
                  }}
                  rows={newEntry.includes("\n") ? 12 : 5}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {charCount} / 10,000
                  </p>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>
              </div>
              <Button onClick={handleAddEntry}>
                <Plus className="mr-2 h-4 w-4" />
                {t("journal.addEntry")}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t("journal.noEntries")}</p>
              </div>
            ) : (
              entries.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {new Date(entry.date).toLocaleDateString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Journal;
