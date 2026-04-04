import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

const MyListings = () => {
  const navigate = useNavigate();
  const { data, loading, refetch } = useFetch('/api/marketplace/my-listings');
  const items = data?.data || [];
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/marketplace/${deleteId}`);
      toast.success('Listing deleted.');
      setDeleteId(null);
      refetch();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-header">My Listings</h1>
        <p className="text-text-muted text-sm">{items.length} listings</p>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No listings yet" description="Start selling by creating your first listing."
          action={<button onClick={() => navigate('/marketplace/add')} className="btn-primary">Add Listing</button>} />
      ) : (
        <div className="card-base overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
                <th className="text-left py-3 px-4">Item</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Listed</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-surface-2 transition-all">
                  <td className="py-3 px-4 text-text-primary font-medium">{item.title}</td>
                  <td className="py-3 px-4 text-text-muted capitalize">{item.category?.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4 text-text-primary">{item.isFree ? 'Free' : formatCurrency(item.price)}</td>
                  <td className="py-3 px-4"><Badge variant={item.status}>{item.status}</Badge></td>
                  <td className="py-3 px-4 text-text-muted text-xs">{formatDate(item.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => navigate(`/marketplace/${item._id}`)}
                        className="p-1.5 rounded text-muted hover:text-primary transition-colors"><Eye size={14} /></button>
                      <button onClick={() => setDeleteId(item._id)}
                        className="p-1.5 rounded text-muted hover:text-danger transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Listing" size="sm">
        <p className="text-text-secondary text-sm mb-4">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default MyListings;
