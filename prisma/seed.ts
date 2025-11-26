import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Create a default clinic
    const clinic = await prisma.clinic.upsert({
        where: { id: 'default-clinic-id' },
        update: {},
        create: {
            id: 'default-clinic-id',
            name: 'Clínica Odontológica Demo',
            email: 'contato@clinicademo.com.br',
            phone: '(11) 98765-4321',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
            cnpj: '12.345.678/0001-90',
            description: 'Clínica odontológica de demonstração',
        },
    });

    console.log('✅ Clinic created:', clinic.name);

    // Hash password for admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@clinica.com' },
        update: {},
        create: {
            email: 'admin@clinica.com',
            password: hashedPassword,
            name: 'Administrador',
            role: 'ADMIN',
            active: true,
            clinicId: clinic.id,
        },
    });

    console.log('✅ Admin user created:', adminUser.email);
    console.log('📧 Email: admin@clinica.com');
    console.log('🔑 Password: admin123');

    // Create a professional (dentist)
    const professional = await prisma.professional.create({
        data: {
            name: 'Dr. João Silva',
            email: 'joao.silva@clinica.com',
            phone: '(11) 91234-5678',
            specialty: 'Ortodontia',
            cro: 'CRO-SP 12345',
            active: true,
            clinicId: clinic.id,
        },
    });

    console.log('✅ Professional created:', professional.name);

    // Create dentist user linked to professional
    const dentistPassword = await bcrypt.hash('dentist123', 10);
    const dentistUser = await prisma.user.upsert({
        where: { email: 'dentista@clinica.com' },
        update: {},
        create: {
            email: 'dentista@clinica.com',
            password: dentistPassword,
            name: 'Dr. João Silva',
            role: 'DENTIST',
            active: true,
            clinicId: clinic.id,
            professionalId: professional.id,
        },
    });

    console.log('✅ Dentist user created:', dentistUser.email);
    console.log('📧 Email: dentista@clinica.com');
    console.log('🔑 Password: dentist123');

    // Create receptionist user
    const receptionistPassword = await bcrypt.hash('recep123', 10);
    const receptionistUser = await prisma.user.upsert({
        where: { email: 'recepcao@clinica.com' },
        update: {},
        create: {
            email: 'recepcao@clinica.com',
            password: receptionistPassword,
            name: 'Maria Santos',
            role: 'RECEPTIONIST',
            active: true,
            clinicId: clinic.id,
        },
    });

    console.log('✅ Receptionist user created:', receptionistUser.email);
    console.log('📧 Email: recepcao@clinica.com');
    console.log('🔑 Password: recep123');

    // Create some services
    const services = await prisma.service.createMany({
        data: [
            {
                name: 'Limpeza',
                description: 'Limpeza dental completa',
                price: 150.0,
                duration: 60,
                category: 'Preventiva',
                clinicId: clinic.id,
            },
            {
                name: 'Restauração',
                description: 'Restauração em resina',
                price: 250.0,
                duration: 90,
                category: 'Restauradora',
                clinicId: clinic.id,
            },
            {
                name: 'Clareamento',
                description: 'Clareamento dental a laser',
                price: 800.0,
                duration: 120,
                category: 'Estética',
                clinicId: clinic.id,
            },
            {
                name: 'Extração',
                description: 'Extração de dente',
                price: 200.0,
                duration: 45,
                category: 'Cirurgia',
                clinicId: clinic.id,
            },
        ],
    });

    console.log(`✅ ${services.count} services created`);

    // Create sample patients
    const patients = await prisma.patient.createMany({
        data: [
            {
                name: 'Carlos Oliveira',
                email: 'carlos@email.com',
                phone: '(11) 99876-5432',
                cpf: '123.456.789-00',
                birthDate: new Date('1985-05-15'),
                gender: 'Masculino',
                address: 'Av. Paulista, 1000',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01310-100',
                clinicId: clinic.id,
            },
            {
                name: 'Ana Paula Costa',
                email: 'ana.costa@email.com',
                phone: '(11) 98765-4321',
                cpf: '987.654.321-00',
                birthDate: new Date('1990-08-22'),
                gender: 'Feminino',
                address: 'Rua Augusta, 500',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01305-000',
                clinicId: clinic.id,
            },
        ],
    });

    console.log(`✅ ${patients.count} patients created`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@clinica.com / admin123');
    console.log('Dentist: dentista@clinica.com / dentist123');
    console.log('Receptionist: recepcao@clinica.com / recep123');
}

main()
    .catch((e) => {
        console.error('❌ Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
