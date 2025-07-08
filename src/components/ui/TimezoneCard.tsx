import React, { useEffect, useState } from "react";
import moment from "moment-timezone";

type Props = {
  timezone: {
    label: string;
    value: string;
  };
  referenceTime: moment.Moment;
  timeUnit: "hour" | "minute";
  onUpdateReferenceTime: (newRefTime: moment.Moment) => void;
  onRemove: () => void;
};

const TimezoneCard: React.FC<Props> = ({
  timezone,
  referenceTime,
  timeUnit,
  onUpdateReferenceTime,
  onRemove,
}) => {
  const localMoment = referenceTime.clone().tz(timezone.value);

  // 🕒 Convert current referenceTime to local hours/minutes value
  const [localValue, setLocalValue] = useState<number>(() =>
    timeUnit === "hour"
      ? localMoment.hours()
      : localMoment.hours() * 60 + localMoment.minutes()
  );

  // 🔁 Update slider when referenceTime or timeUnit changes
  useEffect(() => {
    const local = referenceTime.clone().tz(timezone.value);
    setLocalValue(
      timeUnit === "hour"
        ? local.hours()
        : local.hours() * 60 + local.minutes()
    );
  }, [referenceTime, timezone.value, timeUnit]);

  // 🔧 Handle slider movement
  const handleSliderChange = (value: number) => {
    setLocalValue(value);

    const local = referenceTime.clone().tz(timezone.value);

    const newLocalTime =
      timeUnit === "hour"
        ? local.clone().set({ hour: value, minute: 0, second: 0, millisecond: 0 })
        : local.clone().startOf("day").add(value, "minutes");

    const newUtcTime = newLocalTime.clone().utc();
    onUpdateReferenceTime(moment.utc(newUtcTime));
  };

  const formattedTime = localMoment.format("hh:mm A"); // 🕒 e.g., 03:42 PM
  const zoneAbbr = localMoment.format("z");            // e.g., PKT
  const formattedDate = localMoment.format("dddd, MMM D"); // Tue, Jul 9

  // Show currently selected slider value
  const formattedSelectedValue =
    timeUnit === "hour"
      ? `${localValue.toString().padStart(2, "0")}:00`
      : moment().startOf("day").add(localValue, "minutes").format("hh:mm A");

  return (
    <div className="border rounded p-4 shadow-md relative bg-white">
      <button
        className="absolute top-2 right-2 text-red-500"
        onClick={onRemove}
      >
        ✕
      </button>

      <h2 className="text-lg font-bold mb-2">{timezone.label}</h2>

      <div className="flex justify-between items-center text-sm text-gray-700 mb-2">
        <span className="font-bold text-black">
          {formattedTime}{" "}
          <span className="text-xs text-gray-500">{zoneAbbr}</span>
        </span>
        <span className="text-gray-600">{formattedDate}</span>
      </div>

      <input
        type="range"
        min={0}
        max={timeUnit === "hour" ? 23 : 1439}
        value={localValue}
        onChange={(e) => handleSliderChange(Number(e.target.value))}
        className="w-full"
      />

      <div className="text-center text-sm text-gray-500 mt-1">
        Set {timeUnit} in {timezone.label}:{" "}
        <span className="font-semibold">{formattedSelectedValue}</span>
      </div>
    </div>
  );
};

export default TimezoneCard;
