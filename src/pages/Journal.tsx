import { useState, useEffect } from "react";
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
      if (!currentUser) throw new Error("Nicht angemeldet");

      const { error } = await supabase.from("journal_entries").insert({
        user_id: currentUser.id,
        date: new Date().toISOString().split("T")[0],
        content: newEntry,
      });

      if (error) throw error;

      toast.success("Journal-Eintrag hinzugefügt");
      setNewEntry("");
      loadEntries();
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Hinzufügen");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trading Journal</h1>
        <p className="text-muted-foreground">Dokumentiere deine Trading-Erkenntnisse</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Neuer Eintrag</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Was hast du heute gelernt? Dokumentiere deine Trading-Gedanken..."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            rows={5}
          />
          <Button onClick={handleAddEntry}>
            <Plus className="mr-2 h-4 w-4" />
            Eintrag hinzufügen
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Noch keine Journal-Einträge. Erstelle deinen ersten Eintrag!</p>
          </div>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {new Date(entry.date).toLocaleDateString("de-DE", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
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
