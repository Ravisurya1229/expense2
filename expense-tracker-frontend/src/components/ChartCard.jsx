// import {
//   ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
//   PieChart, Pie, LineChart, Line, Cell
// } from "recharts";

// export function BarCard({ title, data, dataKey = "value" }) {
//   return (
//     <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-soft">
//       <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">{title}</h3>
//       <div className="h-56">
//         <ResponsiveContainer>
//           <BarChart data={data}>
//             <XAxis dataKey="label" stroke="currentColor" />
//             <YAxis stroke="currentColor" />
//             <Tooltip />
//             <Bar dataKey={dataKey} radius={[8,8,0,0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

// export function LineCard({ title, data, dataKey = "value" }) {
//   return (
//     <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-soft">
//       <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">{title}</h3>
//       <div className="h-56">
//         <ResponsiveContainer>
//           <LineChart data={data}>
//             <XAxis dataKey="label" stroke="currentColor" />
//             <YAxis stroke="currentColor" />
//             <Tooltip />
//             <Line type="monotone" dataKey={dataKey} stroke="currentColor" strokeWidth={2} dot={false} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

// export function PieCard({ title, data, valueKey = "value", colors = [] }) {
//   return (
//     <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-soft">
//       <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">{title}</h3>
//       <div className="h-56">
//         <ResponsiveContainer>
//           <PieChart>
//             <Pie data={data} dataKey={valueKey} nameKey="label" innerRadius={50} outerRadius={80}>
//               {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length] || "currentColor"} />)}
//             </Pie>
//             <Tooltip />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

// src/components/AppShell.jsx

// src/components/ChartCard.jsx
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, LineChart, Line, Cell
} from "recharts";

export function BarCard({ title, data, dataKey = "value" }) {
  return (
    <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-md">
      <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="label" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip />
            <Bar dataKey={dataKey} radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function LineCard({ title, data, dataKey = "value" }) {
  return (
    <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-md">
      <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="label" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke="currentColor" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PieCard({ title, data, valueKey = "value", colors = [] }) {
  return (
    <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-md">
      <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey={valueKey} nameKey="label" innerRadius={50} outerRadius={80}>
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length] || "currentColor"} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
