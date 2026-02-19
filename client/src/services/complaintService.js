// Mock Service for now
// import { api } from './api';

export const getComplaints = async () => {
    // return api.get('/complaints');
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, title: 'Street Light Broken', status: 'Pending', date: '2023-10-01', description: 'Street light on Main St is not working.' },
                { id: 2, title: 'Garbage Collection', status: 'Resolved', date: '2023-09-25', description: 'Garbage was not collected yesterday.' },
                { id: 3, title: 'Pothole on Road', status: 'In Progress', date: '2023-10-05', description: 'Large pothole causing traffic.' },
            ]);
        }, 800);
    });
};

export const createComplaint = async (complaintData) => {
    // return api.post('/complaints', complaintData);
     return new Promise(resolve => {
        setTimeout(() => {
            resolve({ id: Math.floor(Math.random() * 1000), ...complaintData, status: 'Pending', date: new Date().toISOString().split('T')[0] });
        }, 1000);
    });
};
