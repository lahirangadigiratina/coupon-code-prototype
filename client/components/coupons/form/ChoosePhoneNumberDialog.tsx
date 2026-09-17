import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SAMPLE_CUSTOMER_PHONES } from "@/data/customerPhones";
import { cn } from "@/lib/utils";

const ROW_OPTIONS = [2, 5, 10, 20] as const;
const DEFAULT_PAGE_SIZE = 2;

interface ChoosePhoneNumberDialogProps {
  open: boolean;
  selectedPhones: string[];
  onClose: () => void;
  onAdd: (phones: string[]) => void;
}

function phonesMatch(left: string, right: string): boolean {
  return left.replace(/\s/g, "") === right.replace(/\s/g, "");
}

function matchesSearch(name: string, phone: string, query: string): boolean {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  const compactTerm = term.replace(/\s/g, "");
  return (
    name.toLowerCase().includes(term) ||
    phone.toLowerCase().includes(term) ||
    phone.replace(/\s/g, "").includes(compactTerm)
  );
}

export function ChoosePhoneNumberDialog({
  open,
  selectedPhones,
  onClose,
  onAdd,
}: ChoosePhoneNumberDialogProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const available = useMemo(
    () =>
      SAMPLE_CUSTOMER_PHONES.filter(
        (customer) => !selectedPhones.some((phone) => phonesMatch(phone, customer.phone)),
      ),
    [selectedPhones],
  );

  const filtered = useMemo(
    () => available.filter((customer) => matchesSearch(customer.name, customer.phone, query)),
    [available, query],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(pageStart, pageStart + pageSize);
  const rangeStart = filtered.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + pageSize, filtered.length);

  const toggle = (phone: string) => {
    setPicked((current) =>
      current.some((item) => phonesMatch(item, phone))
        ? current.filter((item) => !phonesMatch(item, phone))
        : [...current, phone],
    );
  };

  const resetLocalState = () => {
    setPicked([]);
    setQuery("");
    setPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
  };

  const handleClose = () => {
    resetLocalState();
    onClose();
  };

  const handleAdd = () => {
    if (picked.length === 0) return;
    onAdd(picked);
    resetLocalState();
    onClose();
  };

  const emptyMessage =
    available.length === 0
      ? "All listed phone numbers are already added."
      : "No matching phone numbers.";

  return (
    <Dialog open={open} onClose={handleClose} className="max-w-lg">
      <h2 className="text-h3">Choose phone number</h2>
      <p className="mt-2 text-body-sm text-muted-foreground">
        Select customer phone numbers to restrict this coupon.
      </p>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name or phone number"
          autoComplete="off"
          className="pl-9"
        />
      </div>

      <ul className="mt-3 divide-y rounded-lg border">
        {pageItems.length === 0 ? (
          <li className="px-3 py-6 text-center text-body-sm text-muted-foreground">{emptyMessage}</li>
        ) : (
          pageItems.map((customer) => {
            const checked = picked.some((phone) => phonesMatch(phone, customer.phone));
            return (
              <li key={customer.phone}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-neutral-50"
                  onClick={() => toggle(customer.phone)}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                      checked
                        ? "border-foreground bg-foreground text-background"
                        : "border-input bg-background",
                    )}
                    aria-hidden
                  >
                    {checked ? <Check className="h-3 w-3" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{customer.name}</span>
                    <span className="block text-caption-sm text-muted-foreground">
                      {customer.phone}
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption-sm text-muted-foreground">
          Showing {rangeStart}-{rangeEnd} of {filtered.length}
        </p>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <label className="flex items-center gap-2 text-caption-sm text-muted-foreground">
            Rows
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Rows per page"
                className="h-8 w-[4.5rem] px-2"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[90]">
                {ROW_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2"
              disabled={currentPage <= 1 || filtered.length === 0}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2"
              disabled={currentPage >= pageCount || filtered.length === 0}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          type="button"
          className="w-full sm:w-auto"
          disabled={picked.length === 0}
          onClick={handleAdd}
        >
          Add selected
        </Button>
      </div>
    </Dialog>
  );
}
