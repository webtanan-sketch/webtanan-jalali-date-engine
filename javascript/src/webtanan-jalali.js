class WebtananJalali {
    static format(year, month, day) {
        return `${year}/${String(month).padStart(2,'0')}/${String(day).padStart(2,'0')}`;
    }

    static isValid(year, month, day) {
        if (month < 1 || month > 12) return false;
        if (day < 1) return false;
        const max = month <= 6 ? 31 : (month <= 11 ? 30 : 30);
        return day <= max;
    }

    static isLeapYear(year) {
        return (((year + 38) * 682) % 2816) < 682;
    }
}

export default WebtananJalali;
