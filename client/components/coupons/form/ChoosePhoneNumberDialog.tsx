import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SAMPLE_CUSTOMER_PHONES } from "@/data/customerPhones";
import { sanitizeIntegerInput } from "@/lib/numericInput";
import { cn } from "@/lib/utils";

function pageButtons(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 0) return [];
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);

  const items: Array<number | "ellipsis"> = [];
  const start = Math.max(1, current - 1);
  const end = Math.min(total, current + 1);

  if (start > 1) {
    items.push(1);
    if (start > 2) items.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) items.push(page);

  if (end < total) {
    if (end < total - 1) items.push("ellipsis");
    items.push(total);
  }

  return items;
}

const PAGE_SIZE = 10;

const pagerControlClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white p-0 text-sm font-medium text-neutral-800 shadow-none hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40";
const pagerActiveClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md border-transparent bg-neutral-950 p-0 text-sm font-medium text-white shadow-none hover:bg-neutral-950";

interface ChoosePhoneNumberDialogProps {
  open: boolean;
  selectedPhones: string[];
  onClose: () => void;
  onAdd: (phones: string[]) => void;
}

function phonesMatch(left: string, right: string): boolean {
  return left.replace(/\s/g, "") === right.replace(/\s/g, "");
}

function SquareCheckbox({
  checked,
  disabled,
}: {
  checked?: boolean;
  disabled?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] border-neutral-700 bg-background",
        checked && "border-foreground bg-foreground text-background",
        disabled && "opacity-40",
      )}
      aria-hidden
    >
      {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
    </span>
  );
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

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + PAGE_SIZE, filtered.length);
  const allPagePicked =
    pageItems.length > 0 &&
    pageItems.every((customer) => picked.some((phone) => phonesMatch(phone, customer.phone)));

  const toggle = (phone: string) => {
    setPicked((current) =>
      current.some((item) => phonesMatch(item, phone))
        ? current.filter((item) => !phonesMatch(item, phone))
        : [...current, phone],
    );
  };

  const togglePage = () => {
    setPicked((current) => {
      if (allPagePicked) {
        return current.filter(
          (phone) => !pageItems.some((customer) => phonesMatch(phone, customer.phone)),
        );
      }
      const next = [...current];
      for (const customer of pageItems) {
        if (!next.some((phone) => phonesMatch(phone, customer.phone))) {
          next.push(customer.phone);
        }
      }
      return next;
    });
  };

  const resetLocalState = () => {
    setPicked([]);
    setQuery("");
    setPage(1);
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
    <Dialog
      open={open}
      onClose={handleClose}
      className="flex max-h-[90dvh] max-w-3xl flex-col overflow-hidden"
    >
      <div className="shrink-0">
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
      </div>

      <div className="mt-3 min-h-0 overflow-hidden rounded-lg border">
        <div className="flex items-center gap-3 border-b px-3 py-2.5">
          <button
            type="button"
            className="flex shrink-0 items-center justify-center"
            onClick={togglePage}
            disabled={pageItems.length === 0}
            aria-label={allPagePicked ? "Clear selection on this page" : "Select all on this page"}
          >
            <SquareCheckbox
              checked={allPagePicked}
              disabled={pageItems.length === 0}
            />
          </button>
          <p className="text-sm text-muted-foreground">
            {picked.length} of {filtered.length} customers
          </p>
        </div>

        <div className="max-h-[410px] overflow-y-auto">
          <table className="w-full table-fixed text-left">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b text-caption-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="w-10 px-3 py-2.5 font-semibold" aria-label="Select" />
                <th className="px-3 py-2.5 font-semibold">Name</th>
                <th className="px-3 py-2.5 font-semibold">Phone</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-body-sm text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                pageItems.map((customer) => {
                  const checked = picked.some((phone) => phonesMatch(phone, customer.phone));
                  return (
                    <tr
                      key={customer.phone}
                      className="cursor-pointer border-b last:border-b-0 hover:bg-neutral-50/80"
                      onClick={() => toggle(customer.phone)}
                    >
                      <td className="w-10 px-3 py-2.5">
                        <SquareCheckbox checked={checked} />
                      </td>
                      <td className="truncate px-3 py-2.5 text-sm font-semibold">{customer.name}</td>
                      <td className="px-3 py-2.5 text-sm text-muted-foreground">{customer.phone}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <p className="text-caption-sm text-muted-foreground">
          Showing {rangeStart}–{rangeEnd} of {filtered.length}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={pagerControlClass}
              disabled={currentPage <= 1 || filtered.length === 0}
              onClick={() => setPage(1)}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={pagerControlClass}
              disabled={currentPage <= 1 || filtered.length === 0}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageButtons(currentPage, pageCount).map((item, index) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className={pagerControlClass}>
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  className={item === currentPage ? pagerActiveClass : pagerControlClass}
                  aria-current={item === currentPage ? "page" : undefined}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              className={pagerControlClass}
              disabled={currentPage >= pageCount || filtered.length === 0}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={pagerControlClass}
              disabled={currentPage >= pageCount || filtered.length === 0}
              onClick={() => setPage(pageCount)}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>

          <label className="flex items-center gap-2 text-caption-sm text-muted-foreground">
            Go to
            <Input
              inputMode="numeric"
              aria-label="Go to page"
              className="h-8 w-8 rounded-md border-neutral-200 bg-white px-0 text-center shadow-none"
              defaultValue={currentPage}
              key={currentPage}
              onChange={(event) => {
                event.target.value = sanitizeIntegerInput(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                const next = Number((event.target as HTMLInputElement).value);
                if (!Number.isFinite(next) || next < 1) return;
                setPage(Math.min(pageCount, Math.max(1, Math.trunc(next))));
              }}
            />
          </label>
        </div>
      </div>

      <div className="mt-6 shrink-0 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
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
