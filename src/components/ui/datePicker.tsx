import type { FC } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import moment from "moment";

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

const DatePicker: FC<DatePickerProps> = ({ selectedDate, onChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {moment(selectedDate).format("MMM D, YYYY")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              const updated = new Date(date);
              updated.setHours(selectedDate.getHours());
              updated.setMinutes(selectedDate.getMinutes());
              updated.setSeconds(selectedDate.getSeconds());
              onChange(updated);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
