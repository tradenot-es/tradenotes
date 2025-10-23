import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  date: string;
  content: string;
}

const mockJournalEntries: JournalEntry[] = [
  {
    id: "1",
    date: "2025-01-19",
    content: "Great trading day. Market showed strong momentum. Followed my plan strictly.",
  },
  {
    id: "2",
    date: "2025-01-18",
    content: "Took a loss on MSFT but it was within my risk parameters. Need to work on entry timing.",
  },
];

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [newEntry, setNewEntry] = useState("");

  const handleAddEntry = () => {
    if (newEntry.trim()) {
      const entry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        content: newEntry,
      };
      setEntries([entry, ...entries]);
      setNewEntry("");
      toast.success("Journal entry added");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trading Journal</h1>
        <p className="text-muted-foreground">Document your trading insights and learnings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What did you learn today? Document your trading thoughts..."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            rows={5}
          />
          <Button onClick={handleAddEntry}>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {new Date(entry.date).toLocaleDateString("en-US", {
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
        ))}
      </div>
    </div>
  );
};

export default Journal;
