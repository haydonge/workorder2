import React, { useState, useEffect } from 'react';
import logocolor from "/public/logo23.svg";

const AeToggle = () => {
  const [data, setData] = useState([]);
  const [currentFilter, setCurrentFilter] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("https://opensheet.elk.sh/1ge-pyzr0uMTxlALiiUh_sEzdVo1ikGJGavLF04u6AVU/5");
      const jsonData = await response.json();
      setData(jsonData);
      const sortedByEnddate = filterAndSortData(jsonData);
      setCurrentFilter(sortedByEnddate);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const filterAndSortData = (data) => {
    const filteredData = data
      .filter(item => (item.Status === "On Going" || item.Status === "Delay"))
      .map(item => ({
        week: item.week,
        workorder: item.item,
        requestor: item.Requester,
        owner: item.Owner,
        customer: item.Customer,
        works: item.Actions,
        startdate: item.StartDate,
        enddate: item.DueDate,
        status: item.Status,
        priority: item.Priority,
      }));

    return filteredData.sort((a, b) => new Date(a.enddate) - new Date(b.enddate));
  };

  const sortByPriority = () => {
    const sortedData = [...currentFilter].sort((a, b) => {
      if (a.priority === b.priority) return 0;
      return a.priority === "急" ? -1 : 1;
    });
    setCurrentFilter(sortedData);
  };

  const sortByEndDate = () => {
    const sortedData = [...currentFilter].sort((a, b) => new Date(a.enddate) - new Date(b.enddate));
    setCurrentFilter(sortedData);
  };

  const WorkCard = ({ data }) => (
    <div className={`relative shadow-md rounded-lg p-4 mb-4 ${data.priority === '急' ? 'bg-red-300' : 'bg-green-200'}`}>
      {data.priority === '急' && (
        <img
          src="/logo23.svg"
          alt="Logo"
          className="absolute top-0 right-0 w-14 h-14 m-2"
          style={{ color: 'red' }}
        />
      )}
      <h3 className="text-lg font-semibold">{data.works}</h3>
      <p className="text-gray-600">申请人: {data.requestor}</p>
      <p className="text-gray-600">工单号: {data.workorder}</p>
      <p className="text-gray-600">申请日期: {data.startdate}</p>
      <p className="text-gray-600">需求日期: {data.enddate}</p>
      <p className="text-gray-600">状态: {data.status}</p>
      <p className="text-gray-600">客户: {data.customer}</p>
      <p className="text-gray-600">负责人: {data.owner}</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <button 
          onClick={sortByEndDate}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          按截止日期排序
        </button>
        <button 
          onClick={sortByPriority}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          按优先级排序
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {currentFilter.map((item, index) => (
          <WorkCard key={index} data={item} />
        ))}
      </div>
    </div>
  );
};

export default AeToggle;