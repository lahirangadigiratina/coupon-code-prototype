import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SAMPLE_CUSTOMER_PHONES } from "@/data/customerPhones";
import { sanitizeIntegerInput } from "@/lib/numericInput";

const PAGE_SIZE = 10;

const pagerControlClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white p-0 text-sm font-medium text-neutral-800 shadow-none hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40";
const pagerActiveClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md border-transparent bg-neutral-950 p-0 text-sm font-medium text-white shadow-none hover:bg-neutral-950";

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

function phonesMatch(left: string, right: string): boolean {
  return left.replace(/\s/g, "") === right.replace(/\s/g, "");
}

function customerName(phone: string): string {
  return SAMPLE_CUSTOMER_PHONES.find((customer) => phonesMatch(customer.phone, phone))?.name ?? "Added number";
}

interface SelectedPhonesDialogProps {
  open: boolean;
  phones: string[];
  onClose: () => void;
  onChange: (phones: string[]) => void;
}

export function SelectedPhonesDialog({
  open,
  phones,
  onClose,
  onChange,
}: SelectedPhonesDialogProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const compact = term.replace(/\s/g, "");
    return phones.filter((phone) => {
      if (!term) return true;
      const name = customerName(phone).toLowerCase();
      return name.includes(term) || phone.toLowerCase().includes(term) || phone.replace(/\s/g, "").includes(compact);
    });
  }, [phones, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + PAGE_SIZE, filtered.length);

  const handleClose = () => {
    setQuery("");
    setPage(1);
    onClose();
  };

  const removePhone = (phone: string) => {
    onChange(phones.filter((item) => !phonesMatch(item, phone)));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="flex max-h-[90dvh] max-w-3xl flex-col overflow-hidden"
    >
      <div className="shrink-0">
        <h2 className="text-h3">Phone numbers</h2>
        <p className="mt-2 text-body-sm text-muted-foreground">
          All phone numbers added to this coupon.
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
        <div className="max-h-[410px] overflow-y-auto">
          <table className="w-full table-fixed text-left">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b text-caption-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2.5 font-semibold">Name</th>
                <th className="px-3 py-2.5 font-semibold">Phone</th>
                <th className="w-12 px-3 py-2.5 font-semibold" aria-label="Remove" />
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-body-sm text-muted-foreground">
                    {phones.length === 0 ? "No phone numbers added." : "No matching phone numbers."}
                  </td>
                </tr>
              ) : (
                pageItems.map((phone) => (
                  <tr key={phone} className="border-b last:border-b-0">
                    <td className="truncate px-3 py-2.5 text-sm font-semibold">{customerName(phone)}</td>
                    <td className="px-3 py-2.5 text-sm text-muted-foreground">{phone}</td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        aria-label={`Remove ${phone}`}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
                        onClick={() => removePhone(phone)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <p className="text-caption-sm text-muted-foreground">
          Page {rangeStart}–{rangeEnd} of {filtered.length}
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

      <div className="mt-6 flex shrink-0 justify-end">
        <Button type="button" onClick={handleClose}>
          Done
        </Button>
      </div>
    </Dialog>
  );
}
