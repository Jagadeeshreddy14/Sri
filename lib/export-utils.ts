import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers.map((header) => JSON.stringify(obj[header] ?? '')).join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
