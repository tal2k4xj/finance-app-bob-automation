import React from 'react';
import { TIME_WINDOWS, TIME_WINDOW_LABELS } from '../../constants/chartConfig';
import './TimeWindowSelector.css';

const TimeWindowSelector = ({ selected, onChange }) => {
  const windows = [TIME_WINDOWS.DAY, TIME_WINDOWS.WEEK, TIME_WINDOWS.QUARTER];

  return (
    <div className="time-window-selector">
      <div className="selector-label">Time Period:</div>
      <div className="selector-buttons">
        {windows.map(window => (
          <button
            key={window}
            className={`window-button ${selected === window ? 'active' : ''}`}
            onClick={() => onChange(window)}
            aria-pressed={selected === window}
          >
            {TIME_WINDOW_LABELS[window]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeWindowSelector;

// Made with Bob
