import dayjs, { Dayjs } from "dayjs";
import isoWeek from 'dayjs/plugin/isoWeek';
import { DATE_BACKEND_FORMAT, DATE_DISPLAY_FORMAT } from "../constants/DateFormatConstants";

dayjs.extend(isoWeek);

class DateWrapper {
    private date: Dayjs;

    constructor(date?: string | Date | Dayjs) {
        this.date = dayjs(date);
    }

    getDateWrapper(): Dayjs {
        return this.date;
    }

    formatDate = (format: string = DATE_BACKEND_FORMAT): string => {
        return this.date.format(format);
    };

    getDisplayFormat = (formate : string = DATE_DISPLAY_FORMAT): string => {
        return this.date.format(formate);
    }

    getFourDigitYear = (): number => {
        return parseInt(this.date.format("YYYY"));
    }

    getTwoDigitYear = (): number => {
        return parseInt(this.date.format("YY"));
    }

    getDate = (): number => {
        return parseInt(this.date.format("D"));
    }

    getMonth = (): number => {
        return parseInt(this.date.format("M"));
    }

    getTwoDigitMonth = (): string => {
        return this.date.format("MM");
    }

    getAbbreviatedMonthName = (): string => {
        return this.date.format("MMM");
    }

    getFullMonthName = (): string => {
        return this.date.format("MMMM");
    }

    getDayOfMonth = (): number => {
        return parseInt(this.date.format("D"));
    }

    getWeekDay = (): number => {
        return this.date.isoWeekday();
    }

    getWeekDayName = (): string => {
        return this.date.format("dddd");
    }

    getShorterWeekDayName = (): string => {
        return this.date.format("ddd");
    }

    isEqualDates = (date: DateWrapper): boolean => {
        return this.date.format(DATE_BACKEND_FORMAT) === date.formatDate();
    }

    static now(): DateWrapper {
        return new DateWrapper(dayjs());
    }
}

export default DateWrapper;