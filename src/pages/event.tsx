import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, Calendar } from 'lucide-react';
import { MainLayout } from "@/components/layout/MainLayout";
import FriendComponent from "@/components/feed/frindereaquest"

const EventsPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // بيانات تجريبية للـ events
  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: "اجتماع فريق التصميم",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 10, 0),
        duration: 90,
        location: "قاعة الاجتماعات - الطابق الثالث",
        description: "مناقشة التصاميم الجديدة للمشروع القادم وعرض النماذج الأولية",
        attendees: 8,
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        category: "عمل"
      },
      {
        id: 2,
        title: "حفل توزيع الجوائز",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3, 18, 30),
        duration: 120,
        location: "القاعة الكبرى",
        description: "حفل توزيع جوائز الموظف المتميز للربع الأول من العام",
        attendees: 50,
        image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1164&q=80",
        category: "احتفال"
      },
      {
        id: 3,
        title: "ورشة عمل التطوير",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 14, 0),
        duration: 180,
        location: "معمل التدريب - مبنى B",
        description: "ورشة عمل حول أحدث تقنيات التطوير والبرمجة",
        attendees: 25,
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        category: "تدريب"
      },
      {
        id: 4,
        title: "لقاء العملاء السنوي",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5, 9, 0),
        duration: 240,
        location: "فندق جراند هيلتون - قاعة المؤتمرات",
        description: "اللقاء السنوي مع كبار العملاء لمناقشة خطط الشركة المستقبلية",
        attendees: 100,
        image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        category: "عمل"
      },
      {
        id: 5,
        title: "ندوة التكنولوجيا والابتكار",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7, 11, 0),
        duration: 150,
        location: "المكتبة المركزية - قاعة المحاضرات",
        description: "ندوة حول آخر التطورات التكنولوجية وأثرها على قطاع الأعمال",
        attendees: 75,
        image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        category: "ندوة"
      }
    ];
    setEvents(mockEvents);
  }, []);

  // الحصول على الأحداث في تاريخ محدد
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // الحصول على أحداث اليوم
  const getTodaysEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });
  };

  // الحصول على أحداث الغد
  const getTomorrowsEvents = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return events.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === tomorrow.getTime();
    });
  };

  // الانتقال للشهر السابق
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // الانتقال للشهر التالي
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // إنشاء مصفوفة أيام الشهر
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = الأحد, 1 = الاثنين, etc.
    
    // تعديل لبدء الأسبوع من السبت بدلاً من الأحد
    const adjustedStartingDay = startingDay === 0 ? 6 : startingDay - 1;
    
    const days = [];
    
    // إضافة الأيام الفارغة قبل بداية الشهر
    for (let i = 0; i < adjustedStartingDay; i++) {
      days.push(null);
    }
    
    // إضافة أيام الشهر
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // أسماء الأشهر بالعربية
  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  // أسماء الأيام بالعربية
  const dayNames = ["سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];

  // تنسيق الوقت
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // تنسيق التاريخ
  const formatDate = (date) => {
    return date.toLocaleDateString('ar-EG', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // الحصول على لون حسب فئة الحدث
  const getEventCategoryColor = (category) => {
    switch (category) {
      case "عمل": return "bg-blue-100 text-blue-800";
      case "احتفال": return "bg-pink-100 text-pink-800";
      case "تدريب": return "bg-green-100 text-green-800";
      case "ندوة": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">تقويم الأحداث</h1>
        <p className="text-gray-600 mb-8">تصفح وأدر أحداثك القادمة بسهولة</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* التقويم */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex space-x-2">
                <button 
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                >
                  اليوم
                </button>
                <button 
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth().map((day, index) => {
                const isToday = day && new Date().toDateString() === day.toDateString();
                const isSelected = day && selectedDate.toDateString() === day.toDateString();
                const hasEvents = day && getEventsForDate(day).length > 0;
                
                return day ? (
                  <div
                    key={index}
                    className={`p-2 rounded-lg cursor-pointer transition-all border-2
                      ${isToday ? 'border-blue-500' : 'border-transparent'}
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-center font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {day.getDate()}
                    </div>
                    {hasEvents && (
                      <div className="flex justify-center mt-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div key={index} className="p-2"></div>
                );
              })}
            </div>
            
            {/* أحداث اليوم المحدد */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                أحداث {formatDate(selectedDate)}
              </h3>
              
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-4">
                  {getEventsForDate(selectedDate).map(event => (
                    <div 
                      key={event.id} 
                      className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">{event.title}</h4>
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <Clock size={16} className="ml-1" />
                            <span>{formatTime(event.date)}</span>
                            <span className="mx-2">•</span>
                            <span>{event.duration} دقيقة</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>لا توجد أحداث في هذا اليوم</p>
                </div>
              )}
            </div>
          </div>
          
          {/* التفاصيل الجانبية */}
          <div className="space-y-6">
            {/* اليوم */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">أحداث اليوم</h3>
              {getTodaysEvents().length > 0 ? (
                <div className="space-y-3">
                  {getTodaysEvents().map(event => (
                    <div 
                      key={event.id} 
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <h4 className="font-medium text-gray-800">{event.title}</h4>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Clock size={14} className="ml-1" />
                        <span>{formatTime(event.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد أحداث اليوم</p>
              )}
            </div>
            
            {/* غداً */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">أحداث غداً</h3>
              {getTomorrowsEvents().length > 0 ? (
                <div className="space-y-3">
                  {getTomorrowsEvents().map(event => (
                    <div 
                      key={event.id} 
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <h4 className="font-medium text-gray-800">{event.title}</h4>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Clock size={14} className="ml-1" />
                        <span>{formatTime(event.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد أحداث غداً</p>
              )}
            </div>
            
            {/* إضافة حدث جديد */}
            <div className="bg-blue-50 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">إضافة حدث جديد</h3>
              <p className="text-gray-600 mb-4">أضف حدثاً جديداً إلى تقويمك</p>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                إضافة حدث
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* تفاصيل الحدث (Modal) */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img 
                src={selectedEvent.image} 
                alt={selectedEvent.title}
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedEvent.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventCategoryColor(selectedEvent.category)}`}>
                  {selectedEvent.category}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <Calendar size={20} className="ml-2 text-gray-500" />
                  <div>
                    <p className="font-medium">{formatDate(selectedEvent.date)}</p>
                    <p className="text-sm">{formatTime(selectedEvent.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Clock size={20} className="ml-2 text-gray-500" />
                  <p className="font-medium">{selectedEvent.duration} دقيقة</p>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <MapPin size={20} className="ml-2 text-gray-500" />
                  <p className="font-medium">{selectedEvent.location}</p>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Users size={20} className="ml-2 text-gray-500" />
                  <p className="font-medium">{selectedEvent.attendees} مشارك</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">الوصف</h3>
                <p className="text-gray-600">{selectedEvent.description}</p>
              </div>
              
              <div className="flex space-x-3">
                <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  تعديل الحدث
                </button>
                <button className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
                  حذف الحدث
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </MainLayout>
  );
};

export default EventsPage;