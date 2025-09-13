import React, { useState } from 'react';

const StatusUpdateButton = ({ poster, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const statusOptions = [
    { value: 'notStarted', label: '未着手', color: '#dc3545' },
    { value: 'inProgress', label: '作業中', color: '#ffc107' },
    { value: 'completed', label: '完了', color: '#28a745' },
    { value: 'removed', label: '撤去済み', color: '#6c757d' }
  ];
  
  const handleStatusChange = async (newStatus) => {
    if (newStatus === poster.status) return;
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(
        'https://twt8aez0je.execute-api.ap-northeast-1.amazonaws.com/prod/update-status',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            posterNumber: poster.posterNumber,
            status: newStatus,
            installer: '作業者A',
            installDate: new Date().toISOString().split('T')[0]
          })
        }
      );
      
      if (response.ok) {
        alert('ステータスを更新しました！');
        if (onUpdate) onUpdate();
      } else {
        alert('更新に失敗しました');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const currentStatus = statusOptions.find(s => s.value === poster.status);
  
  return (
    <select
      value={poster.status}
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={isUpdating}
      style={{
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        backgroundColor: currentStatus?.color || '#fff',
        color: 'white',
        fontWeight: 'bold',
        cursor: isUpdating ? 'wait' : 'pointer'
      }}
    >
      {statusOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default StatusUpdateButton;