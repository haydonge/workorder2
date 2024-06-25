import React, { useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import logocolor from "/public/logo23.svg";
const response = await fetch("https://opensheet.elk.sh/1ge-pyzr0uMTxlALiiUh_sEzdVo1ikGJGavLF04u6AVU/4");
const data = await response.json();

// console.log(data);


const filterData = (data, isUrgent) =>
  data.filter(item => item.完成状态 === "未完成" && (isUrgent ? item.急单 === "急" : item.急单 !== "急"))
      .map(item => ({
        workorder: item.工单号,
        name: item.申请人,
        works: item.治具名称,
        startdate: item.申请日期,
        enddate: item.需求日期,
        priority: item.急单,
      }));

const filteredData = filterData(data, true);
const filteredData2 = filterData(data, false);

const allFilteredData = [...filteredData, ...filteredData2];


// 按 enddate 排序
const sortedByEnddate = [...allFilteredData].sort((a, b) => new Date(a.enddate) - new Date(b.enddate));

// 按 priority 排序（假设 priority 的值为 "急" 或 "非急"，急单优先）
const sortedByPriority = [...allFilteredData].sort((a, b) => {
  if (a.priority === b.priority) {
    return 0;
  } else if (a.priority === "急") {
    return -1;
  } else {
    return 1;
  }
});

// console.log("Sorted by enddate:", sortedByEnddate);
// console.log("Sorted by priority:", sortedByPriority);

// Workcard 组件
const Workcard = ({ workorder, name, works, startdate, enddate, priority }) => (
  <div className={`relative shadow-md rounded-lg p-4 mb-4 ${priority === '急' ? 'bg-red-300' : 'bg-green-200'}`}>
    {priority === '急' && (
        <img
          src="/logo23.svg"
          alt="Logo"
          class="absolute top-0 right-0 w-14 h-14 m-2"
          style={{ color: 'red' }} // 确保 SVG 颜色变为红色
        />
    )}
    <h3 className="text-lg font-semibold">{works}</h3>
    <p className="text-gray-600">申请人: {name}</p>
    <p className="text-gray-600">工单号: {workorder}</p>
    <p className="text-gray-600">申请日期: {startdate}</p>
    <p className="text-gray-600">需求日期: {enddate}</p>
    {/* <span className={`inline-block px-2 py-1 rounded ${
      priority === '急' ? 'bg-red-200' : 'bg-green-200'
    }`}>
      {priority}
    </span> */}
  </div>
);


// FilterToggle 组件更新以使用新的数据源
const FilterToggle = () => {
  const [currentFilter, setCurrentFilter] = useState(sortedByEnddate);

  const handleToggle = () => {
    setCurrentFilter(currentFilter === sortedByEnddate ? sortedByPriority : sortedByEnddate);
  };

  return (
    <div className="container mx-auto p-4">
      <button 
        onClick={handleToggle}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        切换排序方式
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {currentFilter.map(item => (
          <Workcard 
            key={item.workorder}
            workorder={item.workorder}
            name={item.name}
            works={item.works}
            startdate={item.startdate}
            enddate={item.enddate}
            priority={item.priority}
          />
        ))}
      </div>
    </div>
  );
};

export default FilterToggle;