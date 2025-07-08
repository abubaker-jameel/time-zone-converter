import React, { useEffect, useState } from "react";
import moment from "moment-timezone";
import TimezoneSearchInput from "./TimezoneSearchInput";
import TimezoneCard from "./TimezoneCard";
import { Button } from "./button";

type Timezone = {
  label: string;
  value: string;
  offset: string;
};

type TimeUnit = "hour" | "minute";

type ZoneWithTime = {
  timezone: Timezone;
  referenceTime: moment.Moment;
};

type StoredData = {
  selectedZones: {
    timezone: Timezone;
    referenceTimeISO: string;
  }[];
  timeUnit: TimeUnit;
};

const LOCAL_STORAGE_KEY = "timezone-comparer-data";

const TimezoneComparer: React.FC = () => {
  const [selectedZones, setSelectedZones] = useState<ZoneWithTime[]>([]);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("hour");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed: StoredData = JSON.parse(saved);
      setSelectedZones(
        parsed.selectedZones.map((z) => ({
          timezone: z.timezone,
          referenceTime: moment(z.referenceTimeISO),
        }))
      );
      if (parsed.timeUnit) {
        setTimeUnit(parsed.timeUnit);
      }
    }
  }, []);

  // Save to localStorage when selectedZones or timeUnit changes
  useEffect(() => {
    const toStore: StoredData = {
      selectedZones: selectedZones.map((z) => ({
        timezone: z.timezone,
        referenceTimeISO: z.referenceTime.toISOString(),
      })),
      timeUnit,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toStore));
  }, [selectedZones, timeUnit]);

  // Add new timezone card with accurate time
  const handleAddTimezone = (tz: Timezone) => {
    const alreadyExists = selectedZones.find(
      (z) => z.timezone.value === tz.value
    );
    if (alreadyExists) return;

    const localNow = moment().tz(tz.value);
    const refTime =
      timeUnit === "minute"
        ? localNow.clone().utc()
        : localNow.clone().startOf("hour").utc();

    setSelectedZones((prev) => [
      ...prev,
      {
        timezone: tz,
        referenceTime: refTime,
      },
    ]);
  };

  const handleRemoveTimezone = (value: string) => {
    setSelectedZones((prev) =>
      prev.filter((z) => z.timezone.value !== value)
    );
  };

  const handleReset = () => {
    setSelectedZones([]);
    setTimeUnit("hour");
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <div className="h-full overflow-y-auto bg-white text-sm">
      <div className="flex justify-between items-center">
        <TimezoneSearchInput onSelect={handleAddTimezone} />
        {selectedZones.length > 0 && (
          <Button
            onClick={handleReset}
            className="text-sm bg-white text-red-500 border border-red-300 px-3 py-1 rounded hover:bg-red-50 ml-4"
          >
            Reset All
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm mt-3">
        <span className="text-gray-600 font-medium">Time Unit:</span>
        <select
          value={timeUnit}
          onChange={(e) => {
            const newUnit = e.target.value as TimeUnit;

            setSelectedZones((prev) =>
              prev.map((z) => {
                const localTime = moment().tz(z.timezone.value);
                const newRefTime =
                  newUnit === "minute"
                    ? localTime.clone().utc()
                    : localTime.clone().startOf("hour").utc();

                return {
                  ...z,
                  referenceTime: newRefTime,
                };
              })
            );

            setTimeUnit(newUnit);
          }}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="hour">Hour</option>
          <option value="minute">Minute</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
        {selectedZones.map((zone) => (
          <TimezoneCard
            key={zone.timezone.value}
            timezone={zone.timezone}
            referenceTime={zone.referenceTime}
            timeUnit={timeUnit}
            onUpdateReferenceTime={(newTime) => {
              // Sync all sliders on change
              setSelectedZones((prev) =>
                prev.map((z) => ({
                  ...z,
                  referenceTime: newTime.clone(),
                }))
              );
            }}
            onRemove={() => handleRemoveTimezone(zone.timezone.value)}
          />
        ))}
      </div>
    </div>
  );
};

export default TimezoneComparer;
