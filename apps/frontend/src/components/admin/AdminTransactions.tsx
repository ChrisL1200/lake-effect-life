import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import adminApi, { AdminInventoryTransaction } from "../../api/admin";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AdminShell from "./AdminShell";

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseSortBy = (
  value: string | null,
):
  | "id"
  | "itemId"
  | "movementType"
  | "quantityDelta"
  | "createdAt"
  | "customerEmail"
  | "orderNumber"
  | "shipmentStatus" => {
  if (
    value === "id" ||
    value === "itemId" ||
    value === "movementType" ||
    value === "quantityDelta" ||
    value === "createdAt" ||
    value === "customerEmail" ||
    value === "orderNumber" ||
    value === "shipmentStatus"
  ) {
    return value;
  }
  return "createdAt";
};

const parseSortDirection = (value: string | null): "asc" | "desc" => {
  return value === "asc" ? "asc" : "desc";
};

const AdminTransactions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parsePositiveInt(searchParams.get("page"), 1);
  const initialLimit = parsePositiveInt(searchParams.get("limit"), 25);
  const initialSearch = (searchParams.get("search") || "").trim();
  const initialSortBy = parseSortBy(searchParams.get("sortBy"));
  const initialSortDirection = parseSortDirection(searchParams.get("sortDirection"));
  const token = adminApi.getStoredToken();

  const [rows, setRows] = useState<AdminInventoryTransaction[]>([]);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<
    | "id"
    | "itemId"
    | "movementType"
    | "quantityDelta"
    | "createdAt"
    | "customerEmail"
    | "orderNumber"
    | "shipmentStatus"
  >(initialSortBy);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(initialSortDirection);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    nextParams.set("page", String(page));
    nextParams.set("limit", String(limit));
    if (search) {
      nextParams.set("search", search);
    }
    nextParams.set("sortBy", sortBy);
    nextParams.set("sortDirection", sortDirection);
    setSearchParams(nextParams, { replace: true });
  }, [page, limit, search, sortBy, sortDirection, setSearchParams]);

  const loadTransactions = async (authToken: string) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await adminApi.getInventoryTransactions(authToken, {
        page,
        limit,
        search,
        sortBy,
        sortDirection,
      });
      setRows(response.data);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Admin auth is enabled on backend. Disable it for dev access.");
        return;
      }
      setError(err?.response?.data?.message || "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(token);
  }, [token, page, limit, search, sortBy, sortDirection]);

  const onSortClick = (
    nextSortBy:
      | "id"
      | "itemId"
      | "movementType"
      | "quantityDelta"
      | "createdAt"
      | "customerEmail"
      | "orderNumber"
      | "shipmentStatus",
  ) => {
    if (sortBy === nextSortBy) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(nextSortBy);
    setSortDirection("asc");
  };

  const sortIndicator = (
    key:
      | "id"
      | "itemId"
      | "movementType"
      | "quantityDelta"
      | "createdAt"
      | "customerEmail"
      | "orderNumber"
      | "shipmentStatus",
  ) => {
    if (sortBy !== key) {
      return <ArrowDropDownIcon className="opacity-30" />;
    }

    return sortDirection === "asc" ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />;
  };

  const movementTypeLabel = useMemo(
    () => ({
      ADMIN_SET: "Admin Set",
      RESERVE: "Reserve",
      RELEASE: "Release",
      SALE: "Sale",
      ADJUSTMENT: "Adjustment",
    }),
    [],
  );

  return (
    <AdminShell title="Inventory Transactions">
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <section className="rounded-xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700" htmlFor="admin-transaction-search">
              Search
            </label>
            <input
              id="admin-transaction-search"
              className="w-72 rounded border p-2 text-sm"
              placeholder="id, itemId, movement type, note"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700" htmlFor="transaction-page-size">
              Page size
            </label>
            <select
              id="transaction-page-size"
              className="rounded border p-2 text-sm"
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="inline-flex items-center font-semibold"
                    onClick={() => onSortClick("id")}
                    type="button"
                  >
                    ID {sortIndicator("id")}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="inline-flex items-center font-semibold"
                    onClick={() => onSortClick("itemId")}
                    type="button"
                  >
                    Item ID {sortIndicator("itemId")}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="inline-flex items-center font-semibold"
                    onClick={() => onSortClick("orderNumber")}
                    type="button"
                  >
                    Order # {sortIndicator("orderNumber")}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="inline-flex items-center font-semibold"
                    onClick={() => onSortClick("customerEmail")}
                    type="button"
                  >
                    Customer {sortIndicator("customerEmail")}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  Shipping
                </th>
                <th className="px-4 py-3 font-semibold">Shipped</th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="inline-flex items-center font-semibold"
                    onClick={() => onSortClick("shipmentStatus")}
                    type="button"
                  >
                    Shipment {sortIndicator("shipmentStatus")}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="inline-flex items-center font-semibold"
                    onClick={() => onSortClick("movementType")}
                    type="button"
                  >
                    Type {sortIndicator("movementType")}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="inline-flex items-center font-semibold"
                    onClick={() => onSortClick("quantityDelta")}
                    type="button"
                  >
                    Delta {sortIndicator("quantityDelta")}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Note</th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="inline-flex items-center font-semibold"
                    onClick={() => onSortClick("createdAt")}
                    type="button"
                  >
                    Created {sortIndicator("createdAt")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((movement) => (
                <tr key={movement.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{movement.id}</td>
                  <td className="px-4 py-3">{movement.itemId}</td>
                  <td className="px-4 py-3">{movement.orderNumber || "-"}</td>
                  <td className="px-4 py-3">
                    <div>{movement.customerEmail || "-"}</div>
                    {(movement.customerFirstName || movement.customerLastName) && (
                      <div className="text-xs text-gray-500">
                        {movement.customerFirstName || ""} {movement.customerLastName || ""}
                        {movement.customerIsGuest ? " (Guest)" : ""}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {movement.shippingLine1 ? (
                      <div>
                        <div>{movement.shippingLine1}</div>
                        <div className="text-xs text-gray-500">
                          {movement.shippingCity}, {movement.shippingState}{" "}
                          {movement.shippingPostalCode}
                        </div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {movement.shipmentStatus === "SHIPPED" ||
                    movement.shipmentStatus === "DELIVERED" ? (
                      <span className="text-green-700">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>{movement.shipmentStatus || "Not shipped"}</div>
                    {movement.trackingNumber && (
                      <div className="text-xs text-gray-500">{movement.trackingNumber}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {movementTypeLabel[
                      movement.movementType as keyof typeof movementTypeLabel
                    ] || movement.movementType}
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      movement.quantityDelta >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {movement.quantityDelta >= 0 ? "+" : ""}
                    {movement.quantityDelta}
                  </td>
                  <td className="px-4 py-3">{movement.note || "-"}</td>
                  <td className="px-4 py-3">
                    {movement.createdAt
                      ? new Date(movement.createdAt).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && <p className="px-4 py-3 text-sm text-gray-500">Loading transactions...</p>}
        {!isLoading && rows.length === 0 && (
          <p className="px-4 py-3 text-sm text-gray-500">No transaction records found.</p>
        )}

        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-gray-600">
            Total: {total} | Page {page} of {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button
              className="rounded border p-1 text-sm disabled:opacity-50"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              type="button"
              disabled={page <= 1 || isLoading}
              aria-label="Previous page"
              title="Previous page"
            >
              <ChevronLeftIcon />
            </button>
            <button
              className="rounded border p-1 text-sm disabled:opacity-50"
              onClick={() => setPage((prev) => Math.min(totalPages || 1, prev + 1))}
              type="button"
              disabled={page >= totalPages || isLoading}
              aria-label="Next page"
              title="Next page"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </section>
    </AdminShell>
  );
};

export default AdminTransactions;
