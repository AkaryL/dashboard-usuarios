import React from 'react';
import ResultCard from './ResultCard';

const ResultsContainer = ({ results, currentApiKey, currentMac, proxyUrl }) => {
  const { records, macAddress, timespan } = results;

  return (
    <div className="results-section">
      <div className="success-message">
        ✅ Se encontraron {records.length} resultado(s) para: <strong>{macAddress}</strong>
      </div>
      
      <div className="results">
        {records.map((client, index) => (
          <ResultCard
            key={index}
            client={client}
            index={index}
            currentApiKey={currentApiKey}
            currentMac={currentMac}
            timespan={timespan}
            proxyUrl={proxyUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsContainer;