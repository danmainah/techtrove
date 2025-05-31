"use client"

import { useState, useEffect } from 'react';
import { deleteUser, fetchUsers, editUserRole } from '@/app/dashboard/_actions';
import supabase from '@/lib/supabase';
import { User } from '@/types';

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');

  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching users:', error);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? Their data will be reassigned to another user.')) {
      return;
    }

    try {
      // First, get all gadgets and scraped data owned by this user
      const { data: gadgets, error: gadgetsError } = await supabase
        .from('gadgets')
        .select('id')
        .eq('created_by', userId);

      const { data: scrapedData, error: scrapedError } = await supabase
        .from('scraped_data')
        .select('id')
        .eq('added_by', userId);

      if (gadgetsError || scrapedError) {
        throw new Error('Error fetching user data');
      }

      if (gadgets?.length || scrapedData?.length) {
        // Find the user to get their email and name
        const userToReassign = users.find(user => user.id === userId);
        if (userToReassign) {
          setSelectedUser({
            id: userId,
            email: userToReassign.email,
            name: userToReassign.name,
            role: userToReassign.role,
            gadgets,
            scrapedData
          });
          setIsReassignModalOpen(true);
          return;
        }
      }

      // If no data to reassign, proceed with deletion
      await deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleReassign = async () => {
    if (!selectedUser || !targetUserId) return;

    try {
      // Reassign gadgets
      if (selectedUser.gadgets?.length) {
        await supabase
          .from('gadgets')
          .update({ created_by: targetUserId })
          .in('id', selectedUser.gadgets.map((g) => g.id));
      }

      // Reassign scraped data
      if (selectedUser.scrapedData?.length) {
        await supabase
          .from('scraped_data')
          .update({ added_by: targetUserId })
          .in('id', selectedUser.scrapedData.map((s) => s.id));
      }

      // Delete the user
      await deleteUser(selectedUser.id);
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setSelectedUser(null);
      setIsReassignModalOpen(false);
    } catch (error) {
      console.error('Error reassigning data:', error);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await editUserRole(userId, role);
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role } : user
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-2">{user.email}</h3>
            <p className="text-gray-600 mb-2">Role: {user.role}</p>
            <div className="space-y-2">
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => handleDelete(user.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete User
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reassign Modal */}
      {isReassignModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reassign User Data</h2>
            <p className="mb-4">Select a user to reassign all gadgets and scraped data to:</p>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select a user...</option>
              {users
                .filter((u) => u.id !== selectedUser?.id)
                .map((u) => (
                  <option key={u.id} value={u.id}>{u.email}</option>
                ))}
            </select>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsReassignModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reassign and Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}