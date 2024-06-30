import { useState, useEffect } from 'react';
import { format, addDays, eachDayOfInterval, getMonth } from 'date-fns';

interface IRoomCategory {
  id: string;
  name: string;
  occupancy: number;
  inventory_calendar: IRoomInventoryCalendar[];
  rate_plans: IRatePlan[];
}

interface IRoomInventoryCalendar {
  id: string;
  date: string;
  available: number;
  status: boolean;
  booked: number;
}

interface IRatePlan {
  id: number;
  name: string;
  calendar: IRateCalendar[];
}

interface IRateCalendar {
  id: string;
  date: string;
  rate: number;
  min_length_of_stay: number;
  reservation_deadline: number;
}

const RateCalendar = () => {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [data, setData] = useState<IRoomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.bytebeds.com/api/v1/property/1/room/rate-calendar/assessment?start_date=${startDate}&end_date=${endDate}`);
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const dates = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  // Group dates by month
  const groupedDates = dates.reduce((acc, date) => {
    const month = format(date, 'MMMM yyyy');
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(date);
    return acc;
  }, {});

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Rate Calendar</h1>
      <div className="mb-4 flex small:space-x-2 2xsmall:space-x-0 small:flex-row 2xsmall:flex-col">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded-lg small:w-auto 2xsmall:w-full block"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded-lg small:w-auto 2xsmall:w-full block small:mt-0 2xsmall:mt-2"
        />
      </div>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 gap-6">
          {data.map((room) => (
            <div key={room.id} className="border p-4 rounded-lg shadow-md overflow-x-auto">
              <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border"></th>
                    {Object.keys(groupedDates).map(month => (
                      <th
                        key={month}
                        className="py-1 px-3 border text-center text-base"
                        colSpan={groupedDates[month].length}
                      >
                        {month}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th className="py-1 px-3 border"></th>
                    {dates.map(date => (
                      <th key={date.toString()} className="py-2 px-4 border">
                        {format(date, 'E dd')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 px-3 px-4 border text-nowrap text-base">Room status</td>
                    {room.inventory_calendar.map((inventory) => (
                      <td key={inventory.id} className={`py-2 px-4 border text-white ${inventory.status ? 'bg-green-500' : 'bg-red-500'}`}>
                        {inventory.status ? 'Open' : 'Close'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 px-3 px-4 border text-nowrap text-base">Rooms to sell</td>
                    {room.inventory_calendar.map((inventory) => (
                      <td key={inventory.id} className="py-2 px-4 border">
                        {inventory.available}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 px-3 px-4 border text-nowrap text-base">Net booked</td>
                    {room.inventory_calendar.map((inventory) => (
                      <td key={inventory.id} className="py-2 px-4 border">
                        {inventory.booked}
                      </td>
                    ))}
                  </tr>
                  {room.rate_plans.map((plan) => (
                    <>
                      <tr key={plan.id}>
                        <td className="py-2 px-4 border">{plan.name}</td>
                        {plan.calendar.map((rate) => (
                          <td key={rate.id} className="py-2 px-4 border">
                            {rate.rate}
                          </td>
                        ))}
                      </tr>
                      <tr key={`min-length-${plan.id}`}>
                        <td className="py-1 px-3 px-4 border text-nowrap text-base">Min. length of stay</td>
                        {plan.calendar.map((rate) => (
                          <td key={rate.id} className="py-2 px-4 border">
                            {rate.min_length_of_stay}
                          </td>
                        ))}
                      </tr>
                      <tr key={`min-advance-${plan.id}`}>
                        <td className="py-1 px-3 px-4 border text-nowrap text-base">Min. advance reservation</td>
                        {plan.calendar.map((rate) => (
                          <td key={rate.id} className="py-2 px-4 border">
                            {rate.reservation_deadline}
                          </td>
                        ))}
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RateCalendar;
