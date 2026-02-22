import React from "react";
import { NavLink } from "react-router-dom";

interface AdminShellProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `block rounded px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-black text-white"
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  }`;

const AdminShell: React.FC<AdminShellProps> = ({ title, actions, children }) => {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-2 pb-6">
      <div className="flex items-start gap-4">
        <aside className="sticky top-4 w-56 flex-shrink-0 rounded-xl border bg-white p-3 shadow-sm">
          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Admin
          </h2>
          <nav className="space-y-1">
            <NavLink className={navLinkClassName} to="/admin" end>
              Inventory
            </NavLink>
            <NavLink className={navLinkClassName} to="/admin/transactions">
              Transactions
            </NavLink>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-3xl font-bold">{title}</h1>
            {actions ? <div className="flex gap-2">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
