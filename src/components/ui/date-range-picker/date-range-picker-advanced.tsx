"use client"

import React from "react";
import { Calendar, RangeValue } from "@/components/ui/date-range-picker/advanced-calendar";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay, subDays, subWeeks, subMonths } from "date-fns";

interface DateRangePickerProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

// Convert DateRange to RangeValue
const dateRangeToRangeValue = (dateRange: DateRange | undefined): RangeValue | null => {
  if (!dateRange) return null;
  return {
    start: dateRange.from || null,
    end: dateRange.to || null
  };
};

// Convert RangeValue to DateRange
const rangeValueToDateRange = (rangeValue: RangeValue | null): DateRange | undefined => {
  if (!rangeValue) return undefined;
  return {
    from: rangeValue.start || undefined,
    to: rangeValue.end || undefined
  };
};

export function DateRangePickerAdvanced({ 
  date, 
  onDateChange, 
  placeholder = "Select date range",
  className 
}: DateRangePickerProps) {
  const now = new Date();
  
  // Define presets for common date ranges
  const presets = {
    "today": {
      text: "Today",
      start: startOfDay(now),
      end: endOfDay(now)
    },
    "yesterday": {
      text: "Yesterday", 
      start: startOfDay(subDays(now, 1)),
      end: endOfDay(subDays(now, 1))
    },
    "last-7-days": {
      text: "Last 7 Days",
      start: startOfDay(subDays(now, 7)),
      end: endOfDay(now)
    },
    "last-30-days": {
      text: "Last 30 Days",
      start: startOfDay(subDays(now, 30)),
      end: endOfDay(now)
    },
    "this-week": {
      text: "This Week",
      start: startOfDay(subDays(now, now.getDay())),
      end: endOfDay(now)
    },
    "last-week": {
      text: "Last Week",
      start: startOfDay(subWeeks(now, 1)),
      end: endOfDay(subDays(now, now.getDay()))
    },
    "this-month": {
      text: "This Month",
      start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: endOfDay(now)
    },
    "last-month": {
      text: "Last Month",
      start: startOfDay(subMonths(new Date(now.getFullYear(), now.getMonth(), 1), 1)),
      end: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0))
    }
  };

  const handleChange = (rangeValue: RangeValue | null) => {
    const dateRange = rangeValueToDateRange(rangeValue);
    onDateChange(dateRange);
  };

  return (
    <div className={className}>
      <Calendar
        value={dateRangeToRangeValue(date)}
        onChange={handleChange}
        presets={presets}
        allowClear={true}
        showTimeInput={false}
        horizontalLayout={false}
      />
    </div>
  );
}