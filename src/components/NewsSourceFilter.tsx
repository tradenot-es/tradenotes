import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NewsSource {
  id: string;
  name: string;
  domain: string;
}

interface NewsSourceFilterProps {
  onSourcesChange: (sourceIds: string[]) => void;
}

export function NewsSourceFilter({ onSourcesChange }: NewsSourceFilterProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSourcesAndPreferences();
  }, []);

  const loadSourcesAndPreferences = async () => {
    try {
      setLoading(true);

      // Load available sources
      const { data: sourcesData, error: sourcesError } = await supabase.functions.invoke('financial-news', {
        body: { action: 'get-sources' }
      });

      if (sourcesError) throw sourcesError;

      if (sourcesData.success) {
        setSources(sourcesData.sources);
      }

      // Load user preferences
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: preferences, error: prefError } = await supabase
          .from('news_source_preferences')
          .select('source_id, enabled')
          .eq('user_id', user.id);

        if (prefError) throw prefError;

        if (preferences && preferences.length > 0) {
          const enabled = new Set(
            preferences
              .filter(p => p.enabled)
              .map(p => p.source_id)
          );
          setSelectedSources(enabled);
          onSourcesChange(Array.from(enabled));
        }
      }
    } catch (err: any) {
      console.error('Error loading sources:', err);
      toast({
        title: t("common.error"),
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSourceToggle = (sourceId: string) => {
    const newSelected = new Set(selectedSources);
    if (newSelected.has(sourceId)) {
      newSelected.delete(sourceId);
    } else {
      newSelected.add(sourceId);
    }
    setSelectedSources(newSelected);
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete all existing preferences
      await supabase
        .from('news_source_preferences')
        .delete()
        .eq('user_id', user.id);

      // Insert new preferences for all sources
      const preferences = sources.map(source => ({
        user_id: user.id,
        source_id: source.id,
        source_name: source.name,
        enabled: selectedSources.has(source.id)
      }));

      const { error } = await supabase
        .from('news_source_preferences')
        .insert(preferences);

      if (error) throw error;

      onSourcesChange(Array.from(selectedSources));
      
      toast({
        title: t("common.success"),
        description: "Source preferences saved"
      });
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      toast({
        title: t("common.error"),
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Settings className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Sources ({selectedSources.size})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Filter News Sources</h4>
            <p className="text-xs text-muted-foreground">
              Select which news sources to display
            </p>
          </div>
          
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {sources.map((source) => (
                <div key={source.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={source.id}
                    checked={selectedSources.has(source.id)}
                    onCheckedChange={() => handleSourceToggle(source.id)}
                  />
                  <label
                    htmlFor={source.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {source.name}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-between pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedSources(new Set());
                onSourcesChange([]);
              }}
            >
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const all = new Set(sources.map(s => s.id));
                setSelectedSources(all);
                onSourcesChange(Array.from(all));
              }}
            >
              Select All
            </Button>
            <Button
              size="sm"
              onClick={handleSavePreferences}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}