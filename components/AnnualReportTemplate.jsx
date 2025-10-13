'use client';

import { useState, useEffect } from 'react';
import { FileText, Printer, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AnnualReportTemplate({ companyName, period, onClose }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [reportData, setReportData] = useState({
    companyName: companyName || 'Company Name',
    period: period || '2024',
    dateRange: `For the year ended December 31, ${period || '2024'}`
  });

  // Define all report pages
  const reportPages = [
    // Page 0: Cover Page
    {
      id: 'cover',
      title: 'Cover Page',
      content: (
        <div className="h-full flex flex-col items-center justify-center text-center px-12">
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-[#101828] mb-4">
              {reportData.companyName}
            </h1>
            <h2 className="text-4xl font-semibold text-[#334155] mb-8">
              Annual Report
            </h2>
            <h3 className="text-3xl text-[#475569]">
              {reportData.period}
            </h3>
            <div className="mt-16 pt-16 border-t-2 border-gray-300">
              <p className="text-lg text-gray-600">
                {reportData.dateRange}
              </p>
            </div>
          </div>
        </div>
      )
    },

    // Page 1: Index
    {
      id: 'index',
      title: 'Index',
      content: (
        <div className="p-12">
          <h1 className="text-4xl font-bold text-[#101828] mb-8 text-center border-b-2 pb-4">
            Index
          </h1>
          <div className="space-y-4 mt-8">
            <IndexItem pageNumber={3} title="Management Discussion and Analysis (Executive Summary)" />
            <IndexItem pageNumber={5} title="Consolidated Financial Statements" />
            <IndexItem pageNumber={6} title="Consolidated Balance Sheet" indent={true} />
            <IndexItem pageNumber={7} title="Consolidated Profit & Loss Statement" indent={true} />
            <IndexItem pageNumber={8} title="Statement of Changes in Equity" indent={true} />
            <IndexItem pageNumber={9} title="Consolidated Cash Flow Statement" indent={true} />
            <IndexItem pageNumber={10} title="Accounting Policies" />
            <IndexItem pageNumber={15} title="Notes to the Accounts" />
          </div>
        </div>
      )
    },

    // Page 2: Management Discussion and Analysis
    {
      id: 'mda',
      title: 'Management Discussion and Analysis',
      content: (
        <div className="p-12">
          <h1 className="text-4xl font-bold text-[#101828] mb-8 text-center border-b-2 pb-4">
            Management Discussion and Analysis
          </h1>
          <h2 className="text-2xl font-semibold text-[#334155] mb-6">Executive Summary</h2>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h3 className="text-xl font-semibold text-[#101828] mb-3">Overview</h3>
              <p className="mb-4">
                This section provides management's perspective on the financial performance and position of
                {' '}{reportData.companyName} for the fiscal year {reportData.period}.
              </p>
              <p className="text-gray-500 italic">
                [Add detailed discussion of company performance, key achievements, and strategic initiatives]
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-[#101828] mb-3">Financial Highlights</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-500 italic">
                <li>[Total Revenue: $XXX million]</li>
                <li>[Net Profit: $XXX million]</li>
                <li>[Total Assets: $XXX million]</li>
                <li>[Key financial ratios and metrics]</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-[#101828] mb-3">Business Performance</h3>
              <p className="text-gray-500 italic">
                [Discuss operational performance, market conditions, and business segments]
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-[#101828] mb-3">Outlook</h3>
              <p className="text-gray-500 italic">
                [Provide forward-looking statements and future expectations]
              </p>
            </section>
          </div>
        </div>
      )
    },

    // Page 3: Consolidated Financial Statements Heading
    {
      id: 'cfs-heading',
      title: 'Consolidated Financial Statements',
      content: (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-[#101828]">
              Consolidated Financial Statements
            </h1>
            <p className="text-xl text-gray-600 mt-6">
              {reportData.dateRange}
            </p>
          </div>
        </div>
      )
    },

    // Page 4: Consolidated Balance Sheet
    {
      id: 'balance-sheet',
      title: 'Consolidated Balance Sheet',
      content: (
        <div className="p-12">
          <h1 className="text-3xl font-bold text-[#101828] mb-2 text-center">
            Consolidated Balance Sheet
          </h1>
          <p className="text-center text-gray-600 mb-8">As at December 31, {reportData.period}</p>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#101828] text-white">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Particulars</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-32">Note</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-40">{reportData.period}</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-40">{parseInt(reportData.period) - 1}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 font-bold">ASSETS</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">Non-Current Assets</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Property, Plant and Equipment</td>
                <td className="border border-gray-300 px-4 py-2 text-right">1</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Intangible Assets</td>
                <td className="border border-gray-300 px-4 py-2 text-right">2</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Investments</td>
                <td className="border border-gray-300 px-4 py-2 text-right">3</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-semibold bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Total Non-Current Assets</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">Current Assets</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Inventories</td>
                <td className="border border-gray-300 px-4 py-2 text-right">4</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Trade Receivables</td>
                <td className="border border-gray-300 px-4 py-2 text-right">5</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Cash and Cash Equivalents</td>
                <td className="border border-gray-300 px-4 py-2 text-right">6</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-semibold bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Total Current Assets</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-bold bg-[#334155] text-white">
                <td className="border border-gray-300 px-4 py-2">TOTAL ASSETS</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>

              <tr className="bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 font-bold pt-4">EQUITY AND LIABILITIES</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">Equity</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Share Capital</td>
                <td className="border border-gray-300 px-4 py-2 text-right">7</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Retained Earnings</td>
                <td className="border border-gray-300 px-4 py-2 text-right">8</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-semibold bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Total Equity</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">Liabilities</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Non-Current Liabilities</td>
                <td className="border border-gray-300 px-4 py-2 text-right">9</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Current Liabilities</td>
                <td className="border border-gray-300 px-4 py-2 text-right">10</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-semibold bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Total Liabilities</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-bold bg-[#334155] text-white">
                <td className="border border-gray-300 px-4 py-2">TOTAL EQUITY AND LIABILITIES</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },

    // Page 5: Consolidated P&L
    {
      id: 'profit-loss',
      title: 'Consolidated Profit & Loss Statement',
      content: (
        <div className="p-12">
          <h1 className="text-3xl font-bold text-[#101828] mb-2 text-center">
            Consolidated Statement of Profit and Loss
          </h1>
          <p className="text-center text-gray-600 mb-8">{reportData.dateRange}</p>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#101828] text-white">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Particulars</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-32">Note</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-40">{reportData.period}</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-40">{parseInt(reportData.period) - 1}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="font-semibold bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Revenue from Operations</td>
                <td className="border border-gray-300 px-4 py-2 text-right">11</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Other Income</td>
                <td className="border border-gray-300 px-4 py-2 text-right">12</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-semibold bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">Total Income</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>

              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold pt-4">Expenses</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Cost of Materials Consumed</td>
                <td className="border border-gray-300 px-4 py-2 text-right">13</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Employee Benefit Expenses</td>
                <td className="border border-gray-300 px-4 py-2 text-right">14</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Depreciation and Amortization</td>
                <td className="border border-gray-300 px-4 py-2 text-right">15</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Other Expenses</td>
                <td className="border border-gray-300 px-4 py-2 text-right">16</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-semibold bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">Total Expenses</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>

              <tr className="font-bold bg-gray-50">
                <td className="border border-gray-300 px-4 py-3">Profit Before Tax</td>
                <td className="border border-gray-300 px-4 py-3"></td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
              </tr>

              <tr>
                <td className="border border-gray-300 px-4 py-2">Tax Expense</td>
                <td className="border border-gray-300 px-4 py-2 text-right">17</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>

              <tr className="font-bold bg-[#334155] text-white">
                <td className="border border-gray-300 px-4 py-3">Profit for the Year</td>
                <td className="border border-gray-300 px-4 py-3"></td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },

    // Page 6: Statement of Equity
    {
      id: 'equity',
      title: 'Statement of Changes in Equity',
      content: (
        <div className="p-12">
          <h1 className="text-3xl font-bold text-[#101828] mb-2 text-center">
            Consolidated Statement of Changes in Equity
          </h1>
          <p className="text-center text-gray-600 mb-8">{reportData.dateRange}</p>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#101828] text-white">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Particulars</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-40">Share Capital</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-40">Retained Earnings</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-40">Other Reserves</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-40">Total Equity</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="font-semibold bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Balance as at January 1, {parseInt(reportData.period) - 1}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Profit for the year</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Other comprehensive income</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Dividends paid</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-semibold bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">Balance as at December 31, {parseInt(reportData.period) - 1}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>

              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 pt-4" colSpan="5"></td>
              </tr>

              <tr>
                <td className="border border-gray-300 px-4 py-2">Profit for the year</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Other comprehensive income</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Dividends paid</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-bold bg-[#334155] text-white">
                <td className="border border-gray-300 px-4 py-3">Balance as at December 31, {reportData.period}</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },

    // Page 7: Cashflow Statement
    {
      id: 'cashflow',
      title: 'Consolidated Cash Flow Statement',
      content: (
        <div className="p-12">
          <h1 className="text-3xl font-bold text-[#101828] mb-2 text-center">
            Consolidated Cash Flow Statement
          </h1>
          <p className="text-center text-gray-600 mb-8">{reportData.dateRange}</p>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#101828] text-white">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Particulars</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-40">{reportData.period}</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold w-40">{parseInt(reportData.period) - 1}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 font-bold">Cash Flows from Operating Activities</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Profit before tax</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Adjustments for:</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-12">Depreciation and amortization</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-12">Interest expense</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-12">Interest income</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-semibold bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">Operating profit before working capital changes</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Changes in working capital:</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-12">(Increase) / Decrease in trade receivables</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-12">(Increase) / Decrease in inventories</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-12">Increase / (Decrease) in trade payables</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-semibold bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Cash generated from operations</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Income taxes paid</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-bold bg-gray-100">
                <td className="border border-gray-300 px-4 py-3">Net cash from operating activities (A)</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
              </tr>

              <tr className="bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 font-bold pt-4">Cash Flows from Investing Activities</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Purchase of property, plant and equipment</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Interest received</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-bold bg-gray-100">
                <td className="border border-gray-300 px-4 py-3">Net cash used in investing activities (B)</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
              </tr>

              <tr className="bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 font-bold pt-4">Cash Flows from Financing Activities</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Proceeds from borrowings</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Repayment of borrowings</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Dividends paid</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 pl-8">Interest paid</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-bold bg-gray-100">
                <td className="border border-gray-300 px-4 py-3">Net cash from/(used in) financing activities (C)</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
              </tr>

              <tr className="font-bold bg-[#334155] text-white">
                <td className="border border-gray-300 px-4 py-3">Net increase in cash and cash equivalents (A+B+C)</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Cash and cash equivalents at beginning of year</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
              </tr>
              <tr className="font-bold bg-gray-100">
                <td className="border border-gray-300 px-4 py-3">Cash and cash equivalents at end of year</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
                <td className="border border-gray-300 px-4 py-3 text-right">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },

    // Page 8: Accounting Policies
    {
      id: 'accounting-policy',
      title: 'Accounting Policies',
      content: (
        <div className="p-12">
          <h1 className="text-4xl font-bold text-[#101828] mb-8 text-center border-b-2 pb-4">
            Significant Accounting Policies
          </h1>

          <div className="space-y-6 text-sm">
            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-3">1. Corporate Information</h2>
              <p className="text-gray-700 leading-relaxed">
                {reportData.companyName} is a company incorporated under the Companies Act. The company is engaged in [describe business activities].
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-3">2. Basis of Preparation</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                These consolidated financial statements have been prepared in accordance with International Financial Reporting Standards (IFRS) as issued by the International Accounting Standards Board (IASB).
              </p>
              <p className="text-gray-700 leading-relaxed">
                The financial statements have been prepared on a historical cost basis, except for certain financial instruments that are measured at fair value.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-3">3. Consolidation</h2>
              <p className="text-gray-700 leading-relaxed">
                The consolidated financial statements comprise the financial statements of the Company and its subsidiaries. Control is achieved when the Company has power over the investee, is exposed to variable returns from its involvement with the investee, and has the ability to use its power to affect its returns.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-3">4. Property, Plant and Equipment</h2>
              <p className="text-gray-700 leading-relaxed">
                Property, plant and equipment are stated at cost less accumulated depreciation and impairment losses. Depreciation is calculated on a straight-line basis over the estimated useful lives of the assets.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-3">5. Revenue Recognition</h2>
              <p className="text-gray-700 leading-relaxed">
                Revenue from contracts with customers is recognized when control of goods or services is transferred to the customer at an amount that reflects the consideration to which the Company expects to be entitled.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-3">6. Financial Instruments</h2>
              <p className="text-gray-700 leading-relaxed">
                Financial assets and liabilities are recognized when the Company becomes a party to the contractual provisions of the instrument. Financial assets are derecognized when the contractual rights to the cash flows expire or are transferred.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-3">7. Taxation</h2>
              <p className="text-gray-700 leading-relaxed">
                Current tax is provided at amounts expected to be paid using the tax rates and laws that have been enacted or substantively enacted by the balance sheet date. Deferred tax is recognized on temporary differences between the carrying amounts of assets and liabilities and their tax bases.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-3">8. Foreign Currency Translation</h2>
              <p className="text-gray-700 leading-relaxed">
                Transactions in foreign currencies are translated at the exchange rates prevailing on the transaction dates. Monetary assets and liabilities denominated in foreign currencies are retranslated at the exchange rate prevailing on the balance sheet date.
              </p>
            </section>
          </div>
        </div>
      )
    },

    // Page 9: Notes to Accounts
    {
      id: 'notes',
      title: 'Notes to the Accounts',
      content: (
        <div className="p-12">
          <h1 className="text-4xl font-bold text-[#101828] mb-8 text-center border-b-2 pb-4">
            Notes to the Consolidated Financial Statements
          </h1>

          <div className="space-y-8 text-sm">
            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-4 bg-gray-100 p-2">Note 1 - Property, Plant and Equipment</h2>
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="bg-[#101828] text-white">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs">Particulars</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-xs">{reportData.period}</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-xs">{parseInt(reportData.period) - 1}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">Land and Buildings</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">Plant and Machinery</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">Furniture and Fixtures</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                  <tr className="font-bold bg-gray-100"><td className="border border-gray-300 px-3 py-2">Total</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-4 bg-gray-100 p-2">Note 2 - Intangible Assets</h2>
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="bg-[#101828] text-white">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs">Particulars</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-xs">{reportData.period}</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-xs">{parseInt(reportData.period) - 1}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">Computer Software</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">Goodwill</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                  <tr className="font-bold bg-gray-100"><td className="border border-gray-300 px-3 py-2">Total</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-4 bg-gray-100 p-2">Note 3 - Investments</h2>
              <p className="text-gray-700 mb-2">Details of investments in subsidiaries and associates:</p>
              <p className="text-gray-500 italic">[Add investment details here]</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-4 bg-gray-100 p-2">Note 4 - Inventories</h2>
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="bg-[#101828] text-white">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs">Particulars</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-xs">{reportData.period}</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-xs">{parseInt(reportData.period) - 1}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">Raw Materials</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">Work in Progress</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">Finished Goods</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                  <tr className="font-bold bg-gray-100"><td className="border border-gray-300 px-3 py-2">Total</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-4 bg-gray-100 p-2">Note 5 - Trade Receivables</h2>
              <p className="text-gray-700 mb-2">Trade receivables are non-interest bearing and are generally on terms of 30 to 90 days.</p>
              <p className="text-gray-500 italic">[Add aging analysis and credit risk disclosure]</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-4 bg-gray-100 p-2">Note 6 - Cash and Cash Equivalents</h2>
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr className="bg-[#101828] text-white">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs">Particulars</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-xs">{reportData.period}</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-xs">{parseInt(reportData.period) - 1}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">Cash on Hand</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">Balances with Banks</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                  <tr className="font-bold bg-gray-100"><td className="border border-gray-300 px-3 py-2">Total</td><td className="border border-gray-300 px-3 py-2 text-right">-</td><td className="border border-gray-300 px-3 py-2 text-right">-</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#101828] mb-4 bg-gray-100 p-2">Note 7-17</h2>
              <p className="text-gray-500 italic">[Additional notes covering Share Capital, Retained Earnings, Liabilities, Revenue, Expenses, etc. will be detailed here following the same format]</p>
            </section>
          </div>
        </div>
      )
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    alert('PDF export functionality will be implemented with jsPDF library');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#101828] text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Annual Report Template</h2>
            <p className="text-sm text-gray-300">{reportData.companyName} - {reportData.period}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#101828] rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={18} />
              Export PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
        </div>

        {/* Page Navigation */}
        <div className="bg-gray-100 px-6 py-3 flex items-center justify-between border-b">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage + 1} of {reportPages.length}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-600">{reportPages[currentPage].title}</span>
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(reportPages.length - 1, currentPage + 1))}
            disabled={currentPage === reportPages.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-200 p-6">
          <div className="bg-white shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
            {reportPages[currentPage].content}
          </div>
        </div>

        {/* Page Thumbnails */}
        <div className="bg-gray-100 px-6 py-3 border-t">
          <div className="flex gap-2 overflow-x-auto">
            {reportPages.map((page, index) => (
              <button
                key={page.id}
                onClick={() => setCurrentPage(index)}
                className={`flex-shrink-0 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  currentPage === index
                    ? 'bg-[#101828] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}. {page.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for Index items
function IndexItem({ pageNumber, title, indent = false }) {
  return (
    <div className={`flex justify-between items-center py-2 border-b border-gray-200 ${indent ? 'pl-6' : ''}`}>
      <span className="text-gray-700 font-medium">{title}</span>
      <span className="text-gray-600">{pageNumber}</span>
    </div>
  );
}
