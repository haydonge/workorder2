import React, { useState, useEffect } from 'react';
import './AeToggle.css'; // 请确保创建这个CSS文件

const AeToggle = () => {
  const [data, setData] = useState([]);
  const [currentFilter, setCurrentFilter] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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

  const handleCardClick = (item) => {
    setEditingItem(item);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 这里需要替换为您的Google Sheets API端点
      const response = await fetch('YOUR_GOOGLE_SHEETS_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem),
      });

      if (response.ok) {
        // 更新本地数据
        const updatedData = currentFilter.map(item => 
          item.workorder === editingItem.workorder ? editingItem : item
        );
        setCurrentFilter(updatedData);
        handleCloseModal();
      } else {
        console.error('Failed to update Google Sheets');
      }
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
    }
  };

  const getCardColorClass = (item) => {
    const today = new Date();
    const endDate = new Date(item.enddate);
    const timeDiff = endDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (item.priority === "急") {
      return "card-urgent";
    } else if (endDate < today) {
      return "card-overdue";
    } else if (daysDiff <= 7) {
      return "card-near-due";
    } else {
      return "card-normal";
    }
  };

  const WorkCard = ({ data }) => (
    <div 
      className={`work-card ${getCardColorClass(data)}`}
      onClick={() => handleCardClick(data)}
    >
      {data.priority === '急' && (
        <img
          src="/logo23.svg"
          alt="Logo"
          className="urgent-logo"
        />
      )}
      <h3>{data.works}</h3>
      <p>申请人: {data.requestor}</p>
      <p>工单号: {data.workorder}</p>
      <p>申请日期: {data.startdate}</p>
      <p>需求日期: {data.enddate}</p>
      <p>状态: {data.status}</p>
      <p>客户: {data.customer}</p>
      <p>负责人: {data.owner}</p>
    </div>
  );


  return (
    <div className="ae-toggle-container">
      <div className="button-group">
        <button onClick={sortByEndDate} className="sort-button">
          按截止日期排序
        </button>
        <button onClick={sortByPriority} className="sort-button">
          按优先级排序
        </button>
      </div>
      <div className="work-card-grid">
        {currentFilter.map((item, index) => (
          <WorkCard key={index} data={item} />
        ))}
      </div>

      {openModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>编辑工单</h2>
            <form onSubmit={handleSubmit}>
              <label>
                治具名称:
                <input
                  type="text"
                  name="works"
                  value={editingItem.works}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                申请人:
                <input
                  type="text"
                  name="requestor"
                  value={editingItem.requestor}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                需求日期:
                <input
                  type="date"
                  name="enddate"
                  value={editingItem.enddate}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                状态:
                <input
                  type="text"
                  name="status"
                  value={editingItem.status}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                优先级:
                <input
                  type="text"
                  name="priority"
                  value={editingItem.priority}
                  onChange={handleInputChange}
                />
              </label>
              <div className="button-group">
                <button type="button" onClick={handleCloseModal}>取消</button>
                <button type="submit">提交</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AeToggle;