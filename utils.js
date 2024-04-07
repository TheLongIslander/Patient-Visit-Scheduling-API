const Holidays = require('date-holidays');
const hd = new Holidays('US');

const isWeekend = (date) => 
{
    const day = date.getDay();
    return day === 0 || day === 6; // 0 for Sunday, 6 for Saturday
};
  
  const formatDate = (date) => {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  };

  const convertToICalendarFormat = (dateStr, timeStr = "09:00:00") => {
    const datePart = dateStr.replace(/-/g, '');
    const timePart = timeStr.replace(/:/g, '');
    return `${datePart}T${timePart}Z`;
};

const convertFromICalendarFormat = (iCalendarDateTime) => {
    const datePart = iCalendarDateTime.slice(0, 8); // Extract YYYYMMDD part
    return `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`;
  };
  const convertTimestampForDisplay = (iCalendarDTSTAMP) => {
    // Convert to JavaScript's understood format if necessary
    // Example: 20240219T232123048Z -> 2024-02-19T23:21:23Z
    return iCalendarDTSTAMP.replace(
        /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\d{3}Z$/,
        "$1-$2-$3T$4:$5:$6Z"
    );
};

const isHoliday = (date) => {
    const holidays = hd.getHolidays(date.getFullYear());
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
    });
  };

  
  module.exports = { isWeekend, formatDate, convertToICalendarFormat, convertFromICalendarFormat,convertTimestampForDisplay, isHoliday};
  