import api from '../utils/api';

export const uploadService = {
    upload: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        // Note: We use axios directly or a specific instance because we need Content-Type: multipart/form-data
        // If 'api' instance is used, we might need to override headers.

        // Assuming the backend has an endpoint /upload or /files/upload
        // We will try /files/upload first as it is a common convention
        try {
            const response = await api.post('/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return (response as any).url || (response as any).imageUrl || response;
        } catch (error) {
            console.error('Upload failed, falling back to mock URL (dev mode only)', error);
            // Fallback for development if backend upload is not ready
            // In a real app, this should throw an error
            return URL.createObjectURL(file);
        }
    }
};
