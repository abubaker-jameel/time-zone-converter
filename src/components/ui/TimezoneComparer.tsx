import React, { useState, useEffect } from "react";
import TimezoneSearchInput from "./TimezoneSearchInput";
import TimezoneCard from "./TimezoneCard";
import moment from "moment-timezone";

type Timezone = {
  label: string;
  value: string;
};

type StoredData = {
  selectedZones: Timezone[];
  referenceTimeISO: string;
  timeUnit: TimeUnit;
};

type TimeUnit = "hour" | "minute";

const LOCAL_STORAGE_KEY = "timezone-comparer-data";

const TimezoneComparer: React.FC = () => {
  const [selectedZones, setSelectedZones] = useState<Timezone[]>([]);
  const [referenceTime, setReferenceTime] = useState<moment.Moment>(() =>
    moment().tz(moment.tz.guess()).startOf("hour")
  );
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("hour");

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed: StoredData = JSON.parse(saved);
      setSelectedZones(parsed.selectedZones || []);
      if (parsed.referenceTimeISO) {
        setReferenceTime(moment(parsed.referenceTimeISO));
      }
      if (parsed.timeUnit) {
        setTimeUnit(parsed.timeUnit);
      }
    }
  }, []);

  useEffect(() => {
    const toStore: StoredData = {
      selectedZones,
      referenceTimeISO: referenceTime.toISOString(),
      timeUnit,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toStore));
  }, [selectedZones, referenceTime, timeUnit]);

  const handleAddTimezone = (tz: Timezone) => {
    if (!selectedZones.find((z) => z.value === tz.value)) {
      setSelectedZones((prev) => [...prev, tz]);
    }
  };

  const handleRemoveTimezone = (value: string) => {
    setSelectedZones((prev) => prev.filter((tz) => tz.value !== value));
  };

  const handleReset = () => {
    setSelectedZones([]);
    setReferenceTime(moment().tz(moment.tz.guess()).startOf("hour"));
    setTimeUnit("hour");
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <div className="space-y-4 overflow-y-auto h-full">
      <div className="flex justify-between items-center">
        <TimezoneSearchInput onSelect={handleAddTimezone} />
        {selectedZones.length > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-red-500 border border-red-300 px-3 py-1 rounded hover:bg-red-50 ml-4"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600 font-medium">Time Unit:</span>
        <select
          value={timeUnit}
          onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="hour">Hour</option>
          <option value="minute">Minute</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
        {selectedZones.map((tz) => (
          <TimezoneCard
            key={tz.value}
            timezone={tz}
            referenceTime={referenceTime}
            timeUnit={timeUnit}
            onUpdateReferenceTime={setReferenceTime}
            onRemove={() => handleRemoveTimezone(tz.value)}
          />
        ))}
      </div>
    </div>
  );
};

export default TimezoneComparer;
