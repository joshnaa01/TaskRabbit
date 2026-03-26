import { 
  getAdminStatsService, 
  getUsersService, 
  updateUserStatusService, 
  deleteUserService, 
  resolveDisputeService 
} from '../services/admin.service.js';

export const getAdminStats = async (req, res) => {
  try {
    const data = await getAdminStatsService();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get All Users
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const users = await getUsersService(role);
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Verify or Update User limits
export const updateUserStatus = async (req, res) => {
  try {
    const user = await updateUserStatusService(req.params.id, req.body);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ success: false, message: error.message });
  }
};

// Admin: Delete user
export const deleteUser = async (req, res) => {
  try {
    await deleteUserService(req.params.id);
    res.status(200).json({ success: true, message: 'User and all related data deleted' });
  } catch (error) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ success: false, message: error.message });
  }
};

// Admin: Resolve Dispute
export const resolveDispute = async (req, res) => {
  try {
    const booking = await resolveDisputeService(req.params.id, req.body);
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, message: error.message });
  }
};
