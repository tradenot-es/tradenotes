import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface JournalEntry {
  id: string;
  date: string;
  content: string;
}

const Journal = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id, date, content")
      .order("date", { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const handleAddEntry = async () => {
    if (!newEntry.trim()) return;

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error(t("journal.notLoggedIn"));

      const { error } = await supabase.from("journal_entries").insert({
        user_id: currentUser.id,
        date: new Date().toISOString().split("T")[0],
        content: newEntry,
      });

      if (error) throw error;

      toast.success(t("journal.entryAdded"));
      setNewEntry("");
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
      <div>
        <h1 className="text-3xl font-bold">{t("journal.title")}</h1>
        <p className="text-muted-foreground">{t("journal.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("journal.newEntry")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={t("journal.placeholder")}
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            rows={5}
          />
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
    </div>
  );
};

export default Journal;
