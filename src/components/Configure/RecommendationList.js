import React, { useState, useEffect } from "react";
import YogasanaCard from "../shared/YogasanaCard";
import { getYogasanaById } from "../../services/yogasanaService";

function RecommendationList({ recommendedYogasanas, onSelectionChange }) {
  const [selectedIds, setSelectedIds] = useState([]);

  function handleCheckboxChange(id) {
    let updatedSelectedIds;

    if (selectedIds.includes(id)) {
      updatedSelectedIds = selectedIds.filter(
        (selectedId) => selectedId !== id
      );
    } else {
      updatedSelectedIds = [...selectedIds, id];
    }

    setSelectedIds(updatedSelectedIds);
  }

  useEffect(() => {
    const selectedYogasanas = selectedIds
      .map((id) => getYogasanaById(id))
      .filter(Boolean);

    onSelectionChange(selectedYogasanas);
  }, [selectedIds, onSelectionChange]);

  return (
    <div>
      <h2>Recommended Yogasanas</h2>
      <p>Select 3-5 yogasanas for your routine</p>

      <div className="recommendation-list">
        {recommendedYogasanas.map((name) => {
          const yogasana = getYogasanaById(name);
          if (!yogasana) return null;

          return (
            <div key={yogasana.id}>
              <input
                type="checkbox"
                checked={selectedIds.includes(yogasana.id)}
                onChange={() => handleCheckboxChange(yogasana.id)}
              />
              <YogasanaCard yogasana={yogasana} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecommendationList;
