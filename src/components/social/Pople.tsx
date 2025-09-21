import React, { useRef } from "react";

const UserCards = () => {
  const people = [
    {
      name: "Seary Victor",
      email: "support@gmail.com",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      cover: "https://images.unsplash.com/photo-1503264116251-35a269479413?w=800",
    },
    {
      name: "John Steere",
      email: "support@gmail.com",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      cover: "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=800",
    },
    {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    },
    {
      name: "Michael Brown",
      email: "michael@example.com",
      image: "https://randomuser.me/api/portraits/men/42.jpg",
      cover: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800",
    },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  // Mouse drag scroll
  const isDown = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeft = React.useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDown.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5; // سرعة التمرير
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">


        {/* Scroll container with mouse drag */}
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-6 scrollbar-hide cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="flex space-x-6 space-x-reverse">
            {people.map((person, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-72 mr-3 bg-white rounded-2xl shadow-lg overflow-hidden relative select-none"
              >
                {/* Cover */}
                <div className="h-28 w-full">
                  <img
                    src={person.cover}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Profile image */}
                <div className="flex justify-center -mt-12">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                  />
                </div>

                {/* Info */}
                <div className="p-5 text-center">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    {person.name}
                  </h2>
                  <p className="text-gray-600 mb-4">{person.email}</p>

                  {/* Action Buttons */}
                  <div className="flex justify-between gap-3">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex-1 transition-colors">
                      إضافة صديق
                    </button>
                    <button className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg flex-1 transition-colors">
                      عرض الملف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
    
      </div>
    </div>
  );
};

export default UserCards;
