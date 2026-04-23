export const StatsCard = ({ icon, title, value, color }) => {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-8 shadow-lg hover:shadow-xl transition transform hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-orange-100 text-sm font-semibold mb-2">{title}</p>
          <p className="text-5xl font-bold text-white">{value}</p>
        </div>
        <div className="bg-white bg-opacity-20 p-4 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="mt-4 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white rounded-full" 
          style={{ width: `${Math.min((value / 20) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};
