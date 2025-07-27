import { Search } from 'lucide-react';


// Komponen untuk tabel transaksi
const RecentTransactions = () => {
    const transactions = [
        { date: '2025-07-25', description: 'Kopi Kenangan', category: 'Dining Out', amount: -2.50 },
        { date: '2025-07-25', description: 'Gojek Ride', category: 'Transportation', amount: -5.75 },
        { date: '2025-07-24', description: 'Monthly Salary', category: 'Income', amount: 1250.00 },
        { date: '2025-07-23', description: 'Groceries at Superindo', category: 'Groceries', amount: -45.20 },
        { date: '2025-07-22', description: 'Netflix Subscription', category: 'Entertainment', amount: -11.00 },
    ];

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search..." className="pl-10 pr-4 py-1.5 border rounded-md text-sm" />
                </div>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Description</th>
                        <th className="px-4 py-2">Category</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx, i) => (
                        <tr key={i} className="border-b">
                            <td className="px-4 py-2">{tx.date}</td>
                            <td className="px-4 py-2 font-medium text-gray-800">{tx.description}</td>
                            <td className="px-4 py-2">{tx.category}</td>
                            <td className={`px-4 py-2 text-right font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default function SheetPage() {
    return (
        <div className="flex flex-col h-full">
            {/* Google Sheet Preview fills all available space */}
            <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-center">
                <div className="text-center w-full h-full flex flex-col justify-center items-center">
                    <p className="text-gray-500">Google Sheet Preview</p>
                    <p className="text-sm text-gray-400">(Embedded view will be here)</p>
                </div>
            </div>
        </div>
    );
}