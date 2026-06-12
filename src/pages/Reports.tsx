import { FileText, Download, Filter, Calendar } from 'lucide-react';

const reports = [
  { id: '1', title: 'Monthly Performance - October 2023', type: 'PDF', date: 'Oct 31, 2023', size: '1.2 MB' },
  { id: '2', title: 'Annual Tax Statement 2022', type: 'PDF', date: 'Jan 15, 2023', size: '4.5 MB' },
  { id: '3', title: 'Investment History Export', type: 'CSV', date: 'Oct 28, 2023', size: '856 KB' },
  { id: '4', title: 'Portfolio Diversification Analysis', type: 'PDF', date: 'Sep 30, 2023', size: '2.1 MB' },
];

export const Reports = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">Generate and download detailed investment reports.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold transition-all">
          Generate New Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Available Reports</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><Filter className="w-5 h-5" /></button>
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><Calendar className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{report.title}</h4>
                    <p className="text-sm text-slate-500">{report.date} • {report.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                    {report.type}
                  </span>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
