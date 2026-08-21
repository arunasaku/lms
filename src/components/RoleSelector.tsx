"use client";

import { useState } from "react";

export function RoleSelector({ defaultRole = "MEMBER", defaultPermissions = {} }: { 
  defaultRole?: string, 
  defaultPermissions?: any 
}) {
  const [role, setRole] = useState(defaultRole);

  return (
    <>
      <div className="space-y-2">
        <label htmlFor="role" className="block text-sm font-medium text-slate-700">Account Role *</label>
        <select 
          id="role" 
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        >
          <option value="MEMBER">Member (Standard Access)</option>
          <option value="STAFF">Staff (Custom Access)</option>
          <option value="LIBRARIAN">Librarian (Manage Staff)</option>
          <option value="ADMIN">Admin (Full Access)</option>
        </select>
      </div>

      {role === "STAFF" && (
        <div className="col-span-1 md:col-span-2 space-y-3 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
          <p className="text-sm font-semibold text-indigo-900">Staff Permissions</p>
          <p className="text-xs text-indigo-700 mb-2">Select which features this staff member can access.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center space-x-3 bg-white p-3 rounded border border-indigo-100 cursor-pointer hover:bg-indigo-50 transition">
              <input type="checkbox" name="permCirculation" defaultChecked={defaultPermissions.permCirculation} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-slate-700">Manage Circulation (Issue/Return)</span>
            </label>
            
            <label className="flex items-center space-x-3 bg-white p-3 rounded border border-indigo-100 cursor-pointer hover:bg-indigo-50 transition">
              <input type="checkbox" name="permCatalog" defaultChecked={defaultPermissions.permCatalog} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-slate-700">Manage Catalog (Add/Edit Books)</span>
            </label>
            
            <label className="flex items-center space-x-3 bg-white p-3 rounded border border-indigo-100 cursor-pointer hover:bg-indigo-50 transition">
              <input type="checkbox" name="permMembers" defaultChecked={defaultPermissions.permMembers} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-slate-700">Manage Members (Add/Edit)</span>
            </label>
            
            <label className="flex items-center space-x-3 bg-white p-3 rounded border border-indigo-100 cursor-pointer hover:bg-indigo-50 transition">
              <input type="checkbox" name="permInventory" defaultChecked={defaultPermissions.permInventory} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-slate-700">Manage Inventory (Verification)</span>
            </label>
            
            <label className="flex items-center space-x-3 bg-white p-3 rounded border border-indigo-100 cursor-pointer hover:bg-indigo-50 transition">
              <input type="checkbox" name="permDashboard" defaultChecked={defaultPermissions.permDashboard} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-slate-700">Access Dashboard (Stats)</span>
            </label>
          </div>
        </div>
      )}
    </>
  );
}
