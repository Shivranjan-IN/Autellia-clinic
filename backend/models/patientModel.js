const prisma = require('../config/database');

class Patient {
    static async create(patientData) {
        try {
            const data = await prisma.patients.create({
                data: patientData
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findAll(limit = 10, offset = 0) {
        try {
            const data = await prisma.patients.findMany({
                take: limit,
                skip: offset
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const data = await prisma.patients.findUnique({
                where: { patient_id: id },
                include: {
                    appointments: true,
                    prescriptions: true,
                    patient_documents: true,
                    invoices: true
                }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const data = await prisma.patients.findFirst({
                where: {
                    users: {
                        emails: {
                            some: {
                                email: email
                            }
                        }
                    }
                },
                include: {
                    appointments: true,
                    prescriptions: true,
                    patient_documents: true,
                    invoices: true
                }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const data = await prisma.patients.findFirst({
                where: { user_id: userId },
                include: {
                    appointments: true,
                    prescriptions: true,
                    patient_documents: true,
                    invoices: true
                }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findByPhone(phone) {
        try {
            const data = await prisma.patients.findFirst({
                where: {
                    users: {
                        contact_numbers: {
                            some: {
                                phone_number: phone
                            }
                        }
                    }
                }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, updates) {
        try {
            const data = await prisma.patients.update({
                where: { patient_id: id },
                data: updates
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const data = await prisma.patients.delete({
                where: { patient_id: id }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async count() {
        try {
            const count = await prisma.patients.count();
            return count;
        } catch (error) {
            throw error;
        }
    }

    // Allergies methods
    static async getAllergies(patientId) {
        try {
            const allergies = await prisma.patient_allergies.findMany({
                where: { patient_id: patientId }
            });
            return allergies;
        } catch (error) {
            throw error;
        }
    }

    static async addAllergy(patientId, allergyData) {
        try {
            const allergy = await prisma.patient_allergies.create({
                data: {
                    patient_id: patientId,
                    allergy_name: allergyData.allergy_name,
                    severity: allergyData.severity || 'Unknown'
                }
            });
            return allergy;
        } catch (error) {
            throw error;
        }
    }

    static async updateAllergy(allergyId, allergyData) {
        try {
            const allergy = await prisma.patient_allergies.update({
                where: { id: allergyId },
                data: {
                    allergy_name: allergyData.allergy_name,
                    severity: allergyData.severity
                }
            });
            return allergy;
        } catch (error) {
            throw error;
        }
    }

    static async deleteAllergy(allergyId) {
        try {
            await prisma.patient_allergies.delete({
                where: { id: allergyId }
            });
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async replaceAllergies(patientId, allergies) {
        try {
            // Delete existing allergies
            await prisma.patient_allergies.deleteMany({
                where: { patient_id: patientId }
            });
            
            // Create new allergies
            if (allergies && allergies.length > 0) {
                const allergyData = allergies.map(a => ({
                    patient_id: patientId,
                    allergy_name: a,
                    severity: 'Unknown'
                }));
                await prisma.patient_allergies.createMany({
                    data: allergyData
                });
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Conditions methods (for chronic diseases)
    static async getConditions(patientId) {
        try {
            const conditions = await prisma.patient_conditions.findMany({
                where: { patient_id: patientId }
            });
            return conditions;
        } catch (error) {
            throw error;
        }
    }

    static async addCondition(patientId, conditionData) {
        try {
            const condition = await prisma.patient_conditions.create({
                data: {
                    patient_id: patientId,
                    condition_name: conditionData.condition_name,
                    diagnosed_date: conditionData.diagnosed_date || null,
                    is_chronic: conditionData.is_chronic || true
                }
            });
            return condition;
        } catch (error) {
            throw error;
        }
    }

    static async updateCondition(conditionId, conditionData) {
        try {
            const condition = await prisma.patient_conditions.update({
                where: { id: conditionId },
                data: {
                    condition_name: conditionData.condition_name,
                    diagnosed_date: conditionData.diagnosed_date,
                    is_chronic: conditionData.is_chronic
                }
            });
            return condition;
        } catch (error) {
            throw error;
        }
    }

    static async deleteCondition(conditionId) {
        try {
            await prisma.patient_conditions.delete({
                where: { id: conditionId }
            });
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async replaceConditions(patientId, conditions, isChronic = true) {
        try {
            // Delete existing conditions
            await prisma.patient_conditions.deleteMany({
                where: { patient_id: patientId }
            });
            
            // Create new conditions
            if (conditions && conditions.length > 0) {
                const conditionData = conditions.map(c => ({
                    patient_id: patientId,
                    condition_name: c,
                    is_chronic: isChronic
                }));
                await prisma.patient_conditions.createMany({
                    data: conditionData
                });
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Medications - using medical_history field or could be added as separate table
    static async updateMedicalHistory(patientId, medicalHistory) {
        try {
            const updated = await prisma.patients.update({
                where: { patient_id: patientId },
                data: { medical_history: medicalHistory }
            });
            return updated;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Patient;
