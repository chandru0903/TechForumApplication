// config.js
export const apiUrl = 'http://192.168.151.27/TechForum/backend';
export const API_BASE_URL = 'http://192.168.151.27/TechForum/backend';

export const endpoints = {
    profile: (userId) => `${apiUrl}/profile_api.php?user_id=${userId}`,
    changePassword: (userId) => `${apiUrl}/profile_api.php?user_id=${userId}`,
};

export const api = {
    async getProfile(userId) {
        const response = await fetch(endpoints.profile(userId));
        return response.json();
    },
    async updateProfile(userId, data) {
        const response = await fetch(endpoints.profile(userId), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    async changePassword(userId, currentPassword, newPassword) {
        const response = await fetch(endpoints.changePassword(userId), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'change_password',
                current_password: currentPassword,
                new_password: newPassword,
            }),
        });
        return response.json();
    },
};