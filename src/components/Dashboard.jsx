import React, { useEffect, useState } from 'react';
import data from '../data/data.json';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function Dashboard() {
  const [region, setRegion] = useState('');
  const [sector, setSector] = useState('');
  const [projectType, setProjectType] = useState('');
  const [year, setYear] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    let result = data;
    if (region) result = result.filter(d => d.GEO === region);
    if (sector) result = result.filter(d => d.SECTOR === sector);
    if (projectType) result = result.filter(d => d.PROJECT_TYPE_GRP === projectType);
    if (year) result = result.filter(d => d.YEAR === Number(year));
    setFilteredData(result);
  }, [region, sector, projectType, year]);

  const getUnique = key => [...new Set(data.map(item => item[key]))].filter(Boolean);
  const regions = getUnique('GEO');
  const sectors = getUnique('SECTOR');
  const projectTypes = getUnique('PROJECT_TYPE_GRP');
  const years = getUnique('YEAR').sort((a, b) => a - b);

  const timeSeriesData = years.map(yr => {
    const yearData = data.filter(d =>
      (!region || d.GEO === region) &&
      (!sector || d.SECTOR === sector) &&
      (!projectType || d.PROJECT_TYPE_GRP === projectType) &&
      d.YEAR === yr
    );
    const totalSpend = yearData.reduce((sum, d) => sum + (d["SPEND (in Billion $)"] || 0), 0);
    return { year: yr, spend: totalSpend };
  }).filter(d => d.spend > 0);

  const barData = [
    {
      type: 'Capital',
      value: filteredData
        .filter(d => d.PROJECT_TYPE_GRP?.toLowerCase().includes('capital'))
        .reduce((sum, d) => sum + (d["SPEND (in Billion $)"] || 0), 0),
    },
    {
      type: 'Maintenance',
      value: filteredData
        .filter(d => d.PROJECT_TYPE_GRP?.toLowerCase().includes('maintenance'))
        .reduce((sum, d) => sum + (d["SPEND (in Billion $)"] || 0), 0),
    },
  ].filter(d => d.value > 0);

  const pieData = Array.from(
    filteredData.reduce((map, d) => {
      const key = d.SECTOR;
      map.set(key, (map.get(key) || 0) + (d["SPEND (in Billion $)"] || 0));
      return map;
    }, new Map()),
    ([name, value]) => ({ name, value })
  ).filter(d => d.value > 0);

  // Bonus CSV download function
  const handleCSVDownload = () => {
    if (filteredData.length === 0) {
      alert('No data to download');
      return;
    }
    const csvRows = [];
    // Headers
    const headers = Object.keys(filteredData[0]);
    csvRows.push(headers.join(','));
    // Data
    filteredData.forEach(row => {
      const values = headers.map(h => `"${row[h]}"`);
      csvRows.push(values.join(','));
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filtered_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Bonus Bookmark filters function
  const handleBookmark = () => {
    const filters = { region, sector, projectType, year };
    localStorage.setItem('dashboardFilters', JSON.stringify(filters));
    alert('Filters bookmarked!');
  };

  // On mount, load bookmarked filters if any
  useEffect(() => {
    const savedFilters = localStorage.getItem('dashboardFilters');
    if (savedFilters) {
      const { region, sector, projectType, year } = JSON.parse(savedFilters);
      setRegion(region || '');
      setSector(sector || '');
      setProjectType(projectType || '');
      setYear(year || '');
    }
  }, []);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto bg-gray-50 rounded-lg shadow-lg">

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="">All Regions</option>
          {regions.map((r, i) => <option key={i} value={r}>{r}</option>)}
        </select>

        <select
          value={sector}
          onChange={e => setSector(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="">All Sectors</option>
          {sectors.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>

        <select
          value={projectType}
          onChange={e => setProjectType(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="">All Project Types</option>
          {projectTypes.map((p, i) => <option key={i} value={p}>{p}</option>)}
        </select>

        <select
          value={year}
          onChange={e => setYear(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="">All Years</option>
          {years.map((y, i) => <option key={i} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-end gap-4">
        <button
          onClick={handleCSVDownload}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-600 transition transform hover:scale-105"
        >
          Download CSV
        </button>
        <button
          onClick={handleBookmark}
          className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:from-green-700 hover:to-green-600 transition transform hover:scale-105"
        >
          Bookmark Filters
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg" style={{ height: '320px' }}>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Spending Over Time</h2>
          {timeSeriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="spend" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 mt-20">No data available</p>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg" style={{ height: '320px' }}>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Capital vs Maintenance</h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 mt-20">No data available</p>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2" style={{ height: '400px' }}>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Sectoral Split</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 mt-20">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
