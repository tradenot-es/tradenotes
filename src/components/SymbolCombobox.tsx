import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronsUpDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFrequentSymbols } from "@/hooks/useFrequentSymbols";
import { getSymbolsForMarket, fuzzySearch } from "@/lib/symbolData";

interface SymbolComboboxProps {
  value: string;
  onChange: (value: string) => void;
  market: string;
}

export function SymbolCombobox({ value, onChange, market }: SymbolComboboxProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { frequentSymbols } = useFrequentSymbols(market);

  const marketSymbols = useMemo(() => getSymbolsForMarket(market), [market]);

  const filteredSymbols = useMemo(() => {
    if (!search) return marketSymbols;
    return marketSymbols.filter((symbol) => fuzzySearch(search, symbol));
  }, [search, marketSymbols]);

  const frequentSymbolsForMarket = useMemo(() => {
    return frequentSymbols
      .filter((fs) => fs.market === market)
      .map((fs) => fs.symbol);
  }, [frequentSymbols, market]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue.toUpperCase());
    setOpen(false);
    setSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search) {
      e.preventDefault();
      handleSelect(search);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value || t("trades.symbol")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`${t("trades.symbol")}...`}
            value={search}
            onValueChange={setSearch}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              {search ? (
                <div className="py-6 text-center text-sm">
                  <p className="text-muted-foreground mb-2">
                    Press <kbd className="px-2 py-1 text-xs bg-muted rounded">Enter</kbd> to use:
                  </p>
                  <p className="font-semibold text-lg">{search.toUpperCase()}</p>
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Type to search or add custom symbol
                </div>
              )}
            </CommandEmpty>

            {frequentSymbolsForMarket.length > 0 && !search && (
              <CommandGroup heading={
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Most Traded</span>
                </div>
              }>
                {frequentSymbolsForMarket.map((symbol) => (
                  <CommandItem
                    key={`frequent-${symbol}`}
                    value={symbol}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === symbol ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {symbol}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredSymbols.length > 0 && (
              <CommandGroup heading={`${market} Symbols`}>
                {filteredSymbols.slice(0, 50).map((symbol) => (
                  <CommandItem
                    key={symbol}
                    value={symbol}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === symbol ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {symbol}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
