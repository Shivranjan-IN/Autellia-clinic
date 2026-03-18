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

    getTestTypes: async () => {
        return await prisma.lab_test_types.findMany({
            orderBy: { test_name: 'asc' }
        });
    }
};

module.exports = labModel;
