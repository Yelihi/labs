#include <iostream>

class Date {
    private:
     int year_;
     int month_;
     int day_;

     bool isLeapYear(int year);
     int getLastDay(int year, int month);



    public:

        void showDate();
        void setDate(int year, int month, int day);
        void addDay(int inc);
        void addMonth(int inc);
        void addYear(int inc);

        Date(int year, int month, int day){
            year_ = year;
            month_ = month;
            day_ = day;
         }
};

void Date::setDate(int year, int month, int day) {
    year_ = year;
    month_ = month;
    day_ = day;
}

bool Date::isLeapYear(int year) {
    if(year % 4 == 0 && year % 100 != 0) return true;
    if(year % 400 == 0) return true;
    return false;
}

int Date::getLastDay(int year, int month) {
    static int month_day[12] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

    if(month == 2 && isLeapYear(year)) return 29;
    
    return month_day[month - 1];
}

void Date::showDate() {
    std::cout << year_ << "년 " << month_ << "월 " << day_ << "일" << std::endl;
}

void Date::addDay(int day) {
    day_ += day;

    // addMonth를 쓰면 넘김 도중 day_가 월말일로 잘려서 나머지가 사라진다.
    while (day_ > getLastDay(year_, month_)) {
        day_ -= getLastDay(year_, month_);
        month_++;
        if (month_ > 12) {
            month_ = 1;
            year_++;
        }
    }
}

void Date::addMonth(int month) {
    month_ += month;
    // month_가 아직 13 이상인 채로 addYear를 호출하면
    // getLastDay가 month_day[month-1] 범위를 벗어나 day_가 깨진다(예: 1월 0일).
    while (month_ > 12) {
        month_ -= 12;
        year_++;
    }

    int max_day = getLastDay(year_, month_);
    if (day_ > max_day) {
      day_ = max_day;
    }
}

void Date::addYear(int year) {
    year_ += year;

    int max_day = getLastDay(year_, month_);
    if (day_ > max_day) {
      day_ = max_day;
    }
}



int main() {
    Date date(2026, 8, 14);

    date.showDate();
    date.addDay(100);
    date.showDate();
    date.addMonth(100);
    date.showDate();
    date.addYear(100);
    date.showDate();

    return 0;
}
