const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const labModel = {
    createLabOrder: async (orderData) => {
        // Only include fields that exist in the lab_orders table schema
        const validData = {
            patient_id: orderData.patient_id,
            doctor_id: orderData.doctor_id,
            clinic_id: orderData.clinic_id,
            test_type_id: orderData.test_type_id,
            priority: orderData.priority || 'Normal',
            price: orderData.price,
            notes: orderData.notes,
            status: orderData.status || 'Pending',
            order_date: orderData.order_date ? new Date(orderData.order_date) : new Date()
        };

        return await prisma.lab_orders.create({
            data: {
                lab_order_id: `LAB-${Date.now()}`,
                ...validData
            },
            include: {
                patient: {
                    select: {
                        full_name: true,
                        users: {
                            include: {
                                emails: { where: { is_primary: true } }
                            }
                        }
                    }
                },
                doctor: {
                    select: {
                        full_name: true
                    }
                }
            }
        });
    },

    getAllLabOrders: async (filters = {}) => {
        const where = {};
        if (filters.clinic_id) where.clinic_id = parseInt(filters.clinic_id);
        if (filters.patient_id) where.patient_id = filters.patient_id;
        if (filters.doctor_id) where.doctor_id = parseInt(filters.doctor_id);
        if (filters.status) where.status = filters.status;

        return await prisma.lab_orders.findMany({
            where,
            include: {
                patient: {
                    select: {
                        full_name: true,
                        users: {
                            include: {
                                emails: { where: { is_primary: true } }
                            }
                        }
                    }
                },
                doctor: {
                    select: {
                        full_name: true
                    }
                },
                lab_test_types: true,
                clinic: {
                    select: {
                        clinic_name: true
                    }
                },
                lab_test_results: true,
                lab_samples: true
            },
            orderBy: {
                order_date: 'desc'
            }
        });
    },

    getLabOrderById: async (id) => {
        return await prisma.lab_orders.findUnique({
            where: { lab_order_id: id },
            include: {
                patient: {
                    select: {
                        full_name: true,
                        age: true,
                        gender: true,
                        users: {
                            include: {
                                emails: { where: { is_primary: true } },
                                contact_numbers: { where: { is_primary: true } }
                            }
                        }
                    }
                },
                doctor: {
                    select: {
                        full_name: true
                    }
                },
                lab_test_types: true,
                clinic: {
                    select: {
                        clinic_name: true
                    }
                },
                lab_test_results: true,
                lab_samples: true
            }
        });
    },

    updateLabOrderStatus: async (id, status, notes) => {
        return await prisma.lab_orders.update({
            where: { lab_order_id: id },
            data: {
                status,
                ...(notes && { notes })
            }
        });
    },

    deleteLabOrder: async (id) => {
        return await prisma.lab_orders.delete({
            where: { lab_order_id: id }
        });
    },

    getLabByUserId: async (userId) => {
        return await prisma.labs.findUnique({
            where: { user_id: parseInt(userId) },
            include: { address: true }
        });
    },

    getLabDashboardStats: async (labId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalTestsToday, totalBookings, pendingReports, completedReports, revenue] = await Promise.all([
            prisma.lab_orders.count({
                where: {
                    lab_id: labId,
                    order_date: { gte: today }
                }
            }),
            prisma.lab_orders.count({
                where: { lab_id: labId }
            }),
            prisma.lab_orders.count({
                where: { lab_id: labId, status: { not: 'Completed' } }
            }),
            prisma.lab_orders.count({
                where: { lab_id: labId, status: 'Completed' }
            }),
            prisma.lab_order_items.aggregate({
                where: { lab_orders: { lab_id: labId, status: 'Completed' } },
                _sum: { price: true }
            })
        ]);

        const recentActivity = await prisma.lab_orders.findMany({
            where: { lab_id: labId },
            include: {
                patient: { select: { full_name: true } }
            },
            orderBy: { order_date: 'desc' },
            take: 5
        });

        return {
            totalTestsToday,
            totalBookings,
            pendingReports,
            completedReports,
            revenueSummary: revenue._sum.price || 0,
            recentActivity
        };
    },

    getLabBookings: async (labId, filters = {}) => {
        const where = { lab_id: labId };
        if (filters.status) where.status = filters.status;
        if (filters.date) {
            const date = new Date(filters.date);
            date.setHours(0, 0, 0, 0);
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            where.order_date = { gte: date, lt: nextDay };
        }

        return await prisma.lab_orders.findMany({
            where,
            include: {
                patient: {
                    select: {
                        full_name: true,
                        gender: true,
                        date_of_birth: true
                    }
                },
                doctor: { select: { full_name: true } },
                lab_order_items: { include: { lab_test_types: true } }
            },
            orderBy: { order_date: 'desc' }
        });
    },

    getLabTests: async (labId) => {
        return await prisma.lab_tests.findMany({
            where: { lab_id: labId },
            orderBy: { test_name: 'asc' }
        });
    },

    addLabTest: async (data) => {
        return await prisma.lab_tests.create({ data });
    },

    updateLabTest: async (testId, data) => {
        return await prisma.lab_tests.update({
            where: { test_id: parseInt(testId) },
            data
        });
    },

    deleteLabTest: async (testId) => {
        return await prisma.lab_tests.delete({
            where: { test_id: parseInt(testId) }
        });
    },

    getLabStaff: async (labId) => {
        return await prisma.lab_staff.findMany({
            where: { lab_id: labId },
            orderBy: { full_name: 'asc' }
        });
    },

    addLabStaff: async (data) => {
        return await prisma.lab_staff.create({ data });
    },

    updateLabStaff: async (staffId, data) => {
        return await prisma.lab_staff.update({
            where: { id: parseInt(staffId) },
            data
        });
    },

    getClinicConnections: async (labId) => {
        return await prisma.clinic_lab_mapping.findMany({
            where: { lab_id: labId },
            include: {
                clinics: {
                    select: {
                        clinic_name: true,
                        medical_council_reg_no: true,
                        address: true
                    }
                }
            }
        });
    },

    getAllTestTypes: async () => {
        return await prisma.lab_test_types.findMany({
            orderBy: { test_name: 'asc' }
        });
    }
};

module.exports = labModel;
