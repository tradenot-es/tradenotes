import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [defaultFees, setDefaultFees] = useState("2.00");
  const [setups, setSetups] = useState(["Breakout", "Failed Rally", "Gap Fill", "Trend Follow"]);
  const [tags, setTags] = useState(["momentum", "reversal", "tech", "index"]);
  const [newSetup, setNewSetup] = useState("");
  const [newTag, setNewTag] = useState("");

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  const addSetup = () => {
    if (newSetup.trim() && !setups.includes(newSetup.trim())) {
      setSetups([...setups, newSetup.trim()]);
      setNewSetup("");
    }
  };

  const removeSetup = (setup: string) => {
    setSetups(setups.filter((s) => s !== setup));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your trading journal preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic configuration for your trading journal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currency">Base Currency</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fees">Default Fees ($)</Label>
              <Input
                id="fees"
                type="number"
                step="0.01"
                value={defaultFees}
                onChange={(e) => setDefaultFees(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trading Setups</CardTitle>
            <CardDescription>Manage your trading setup patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add new setup..."
                value={newSetup}
                onChange={(e) => setNewSetup(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSetup()}
              />
              <Button onClick={addSetup}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {setups.map((setup) => (
                <Badge key={setup} variant="secondary" className="pr-1">
                  {setup}
                  <button
                    onClick={() => removeSetup(setup)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Manage your trade tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add new tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="pr-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
