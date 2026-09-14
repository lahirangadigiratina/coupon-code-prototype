import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SAMPLE_CUSTOMER_PHONES } from "@/data/customerPhones";
import { cn } from "@/lib/utils";

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

  const toggle = (phone: string) => {
    setPicked((current) =>
      current.some((item) => phonesMatch(item, phone))
        ? current.filter((item) => !phonesMatch(item, phone))
        : [...current, phone],
    );
  };

  const handleClose = () => {
    setPicked([]);
    setQuery("");
    onClose();
  };

  const handleAdd = () => {
    if (picked.length === 0) return;
    onAdd(picked);
    setPicked([]);
    setQuery("");
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
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or phone number"
          autoComplete="off"
          className="pl-9"
        />
      </div>

      <ul className="mt-3 divide-y rounded-lg border">
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-body-sm text-muted-foreground">{emptyMessage}</li>
        ) : (
          filtered.map((customer) => {
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
