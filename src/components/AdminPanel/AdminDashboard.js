// AdminDashboard.js lo switch logic (Example)
import ChefDashboard from './ChefDashboard';
import AdminInventory from './AdminInventory';
const [activeTab, setActiveTab] = useState('orders');

return (
  <div>
     <nav>
        <button onClick={() => setActiveTab('orders')}>Live Orders</button>
        <button onClick={() => setActiveTab('inventory')}>Manage Stock</button>
     </nav>

     {activeTab === 'orders' && <ChefDashboard />} 
     {activeTab === 'inventory' && <AdminInventory />}
  </div>
);