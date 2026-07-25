'use client'
import React from 'react'

const TableSkeleton = ({ rows = 4 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="border-t border-gray-200 animate-pulse">
          <td className="px-4 py-3">
            <div className="flex gap-2 items-center">
              <div className="w-10 h-10 bg-slate-200 rounded" />
              <div className="h-4 w-28 bg-slate-200 rounded" />
            </div>
          </td>
          <td className="px-4 py-3 hidden md:table-cell">
            <div className="h-4 w-48 bg-slate-200 rounded" />
          </td>
          <td className="px-4 py-3 hidden md:table-cell">
            <div className="h-4 w-12 bg-slate-200 rounded" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-12 bg-slate-200 rounded" />
          </td>
          <td className="px-4 py-3 text-center">
            <div className="w-9 h-5 bg-slate-200 rounded-full mx-auto" />
          </td>
        </tr>
      ))}
    </>
  )
}

export default TableSkeleton
