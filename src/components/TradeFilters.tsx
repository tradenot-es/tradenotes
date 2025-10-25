import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, X, Filter } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export interface TradeFilterOptions {
  symbol?: string;
  market?: string;
  setup?: string;
  side?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minPnl?: number;
  maxPnl?: number;
  minRating?: number;
  hasScreenshot?: boolean;
}

interface TradeFiltersProps {
  onFilterChange: (filters: TradeFilterOptions) => void;
  availableSetups?: string[];
  compact?: boolean;
}

export function TradeFilters({ onFilterChange, availableSetups = [], compact = false }: TradeFiltersProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<TradeFilterOptions>({});
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof TradeFilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (value === "" || value === undefined || value === "all") {
      delete newFilters[key];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.keys(filters).length;

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Symbol Filter */}
        <div className="space-y-2">
          <Label htmlFor="symbol">{t("filters.symbol")}</Label>
          <Input
            id="symbol"
            placeholder={t("filters.symbolPlaceholder")}
            value={filters.symbol || ""}
            onChange={(e) => updateFilter("symbol", e.target.value.toUpperCase())}
          />
        </div>

        {/* Market Filter */}
        <div className="space-y-2">
          <Label htmlFor="market">{t("filters.market")}</Label>
          <Select value={filters.market || "all"} onValueChange={(v) => updateFilter("market", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allMarkets")}</SelectItem>
              <SelectItem value="Stock">{t("trades.stock")}</SelectItem>
              <SelectItem value="Futures">{t("trades.futures")}</SelectItem>
              <SelectItem value="Crypto">{t("trades.crypto")}</SelectItem>
              <SelectItem value="Option">{t("trades.option")}</SelectItem>
              <SelectItem value="Forex">{t("trades.forex")}</SelectItem>
              <SelectItem value="Index">{t("trades.index")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Side Filter */}
        <div className="space-y-2">
          <Label htmlFor="side">{t("filters.side")}</Label>
          <Select value={filters.side || "all"} onValueChange={(v) => updateFilter("side", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allSides")}</SelectItem>
              <SelectItem value="long">{t("trades.long")}</SelectItem>
              <SelectItem value="short">{t("trades.short")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Setup Filter */}
        {availableSetups.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="setup">{t("filters.setup")}</Label>
            <Select value={filters.setup || "all"} onValueChange={(v) => updateFilter("setup", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allSetups")}</SelectItem>
                {availableSetups.map((setup) => (
                  <SelectItem key={setup} value={setup}>
                    {setup}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Rating Filter */}
        <div className="space-y-2">
          <Label htmlFor="rating">{t("filters.minRating")}</Label>
          <Select value={filters.minRating?.toString() || "all"} onValueChange={(v) => updateFilter("minRating", v === "all" ? undefined : parseInt(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.anyRating")}</SelectItem>
              <SelectItem value="1">1+ ⭐</SelectItem>
              <SelectItem value="2">2+ ⭐⭐</SelectItem>
              <SelectItem value="3">3+ ⭐⭐⭐</SelectItem>
              <SelectItem value="4">4+ ⭐⭐⭐⭐</SelectItem>
              <SelectItem value="5">5 ⭐⭐⭐⭐⭐</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Screenshot Filter */}
        <div className="space-y-2">
          <Label htmlFor="screenshot">{t("filters.withScreenshot")}</Label>
          <Select value={filters.hasScreenshot?.toString() || "all"} onValueChange={(v) => updateFilter("hasScreenshot", v === "all" ? undefined : v === "true")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              <SelectItem value="true">{t("filters.yes")}</SelectItem>
              <SelectItem value="false">{t("filters.no")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("filters.dateFrom")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? format(filters.dateFrom, "PPP") : t("filters.pickDate")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => updateFilter("dateFrom", date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>{t("filters.dateTo")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? format(filters.dateTo, "PPP") : t("filters.pickDate")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => updateFilter("dateTo", date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* P&L Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minPnl">{t("filters.minPnl")}</Label>
          <Input
            id="minPnl"
            type="number"
            placeholder="-1000"
            value={filters.minPnl || ""}
            onChange={(e) => updateFilter("minPnl", e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPnl">{t("filters.maxPnl")}</Label>
          <Input
            id="maxPnl"
            type="number"
            placeholder="1000"
            value={filters.maxPnl || ""}
            onChange={(e) => updateFilter("maxPnl", e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="mr-2 h-4 w-4" />
          {t("filters.clearFilters")} ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  if (compact) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            {t("filters.filters")}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-4" align="start">
          <FilterContent />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {t("filters.filters")}
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount} {t("filters.active")}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FilterContent />
      </CardContent>
    </Card>
  );
}