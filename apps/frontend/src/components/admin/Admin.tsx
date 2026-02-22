import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseSortBy = (
  value: string | null,
): "id" | "type" | "gender" | "createdAt" => {
  if (value === "id" || value === "type" || value === "gender" || value === "createdAt") {
    return value;
  }
  return "createdAt";
};

const parseSortDirection = (value: string | null): "asc" | "desc" => {
  return value === "asc" ? "asc" : "desc";
};

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parsePositiveInt(searchParams.get("page"), 1);
  const initialLimit = parsePositiveInt(searchParams.get("limit"), 25);
  const initialSearch = (searchParams.get("search") || "").trim();
  const initialSortBy = parseSortBy(searchParams.get("sortBy"));
  const initialSortDirection = parseSortDirection(searchParams.get("sortDirection"));
  const token = api.admin.getStoredToken();
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<"id" | "type" | "gender" | "createdAt">(initialSortBy);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(initialSortDirection);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  const loadInventory = async (authToken: string) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.admin.getInventory(authToken, {
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
      setError(err?.response?.data?.message || "Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory(token);
  }, [token, page, limit, search, sortBy, sortDirection]);

  const handleDelete = async (id: string) => {
    setError("");
    setMessage("");
    try {
      await api.admin.deleteInventory(token, id);
      setMessage(`Deleted ${id}`);
      await loadInventory(token);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Admin auth is enabled on backend. Disable it for dev access.");
        return;
      }
      setError(err?.response?.data?.message || "Delete failed");
    }
  };

  const onSortClick = (nextSortBy: "id" | "type" | "gender" | "createdAt") => {
    if (sortBy === nextSortBy) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(nextSortBy);
    setSortDirection("asc");
  };

  const sortIndicator = (key: "id" | "type" | "gender" | "createdAt") => {
    if (sortBy !== key) {
      return <ArrowDropDownIcon className="opacity-30" />;
    }

    return sortDirection === "asc" ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />;
  };

  const listQueryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) {
      params.set("search", search);
    }
    params.set("sortBy", sortBy);
    params.set("sortDirection", sortDirection);
    return params.toString();
  }, [page, limit, search, sortBy, sortDirection]);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-2 pb-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Admin</h1>
        <div className="flex gap-2">
          <button
            className="rounded border px-3 py-2 text-sm font-semibold"
            onClick={() => navigate("/admin/new")}
            type="button"
          >
            Create Inventory
          </button>
        </div>
      </div>

      {message && <p className="mb-2 text-sm text-green-700">{message}</p>}
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <section className="rounded-xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700" htmlFor="admin-search">
              Search
            </label>
            <input
              id="admin-search"
              className="w-72 rounded border p-2 text-sm"
              placeholder="id, type, gender"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700" htmlFor="page-size">
              Page size
            </label>
            <select
              id="page-size"
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
          <table className="w-full min-w-[900px] text-left text-sm">
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
                    onClick={() => onSortClick("type")}
                    type="button"
                  >
                    Type {sortIndicator("type")}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="inline-flex items-center font-semibold"
                    onClick={() => onSortClick("gender")}
                    type="button"
                  >
                    Gender {sortIndicator("gender")}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="inline-flex items-center font-semibold"
                    onClick={() => onSortClick("createdAt")}
                    type="button"
                  >
                    Created {sortIndicator("createdAt")}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Colors</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item: any) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      className="text-blue-700 underline hover:text-blue-900"
                      to={`/admin/${encodeURIComponent(item.id)}/edit?${listQueryString}`}
                    >
                      {item.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{item.type}</td>
                  <td className="px-4 py-3">{item.gender}</td>
                  <td className="px-4 py-3">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">{item.itemColors?.length || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded border border-red-500 p-1 text-red-600"
                        onClick={() => handleDelete(item.id)}
                        type="button"
                        aria-label={`Delete ${item.id}`}
                        title="Delete"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && <p className="px-4 py-3 text-sm text-gray-500">Loading inventory...</p>}
        {!isLoading && rows.length === 0 && (
          <p className="px-4 py-3 text-sm text-gray-500">No inventory records found.</p>
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
    </div>
  );
};

export default Admin;
