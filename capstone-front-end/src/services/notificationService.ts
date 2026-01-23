import { apiClient, type ApiResponse } from '../utils/api';
import type { Notification, NotificationCount } from '../models/notification.model';

const BASE_PATH = '/notifications';

export const notificationService = {
  // ==================== GET NOTIFICATIONS ====================

  async getMyNotifications(page = 0, size = 20): Promise<ApiResponse<Notification[]>> {
    return apiClient.get<Notification[]>(BASE_PATH, { page, size });
  },

  async getUnreadCount(): Promise<ApiResponse<NotificationCount>> {
    return apiClient.get<NotificationCount>(`${BASE_PATH}/unread-count`);
  },

  // ==================== MARK AS READ ====================

  async markAsRead(id: number): Promise<ApiResponse<Notification>> {
    return apiClient.put<Notification>(`${BASE_PATH}/${id}/read`);
  },

  async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${BASE_PATH}/read-all`);
  },
};

export default notificationService;
