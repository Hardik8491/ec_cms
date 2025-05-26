"use client";

import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { useState } from "react";

interface DateRangePickerProps {
    onUpdate: (range: { start: Date; end: Date }) => void;
    initialRange: { start: Date; end: Date };
}

export function DateRangePicker({
    onUpdate,
    initialRange,
}: DateRangePickerProps) {
    const [date, setDate] = useState<DateRange | undefined>({
        from: initialRange.start,
        to: initialRange.end,
    });

    return (
        <div className='flex items-center gap-2'>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id='date'
                        variant={"outline"}
                        className='w-[260px] justify-start text-left font-normal'
                    >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='end'>
                    <Calendar
                        initialFocus
                        mode='range'
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(range) => {
                            setDate(range);
                            if (range?.from && range?.to) {
                                onUpdate({ start: range.from, end: range.to });
                            }
                        }}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
