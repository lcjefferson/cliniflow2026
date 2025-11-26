const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst()
    if (!user) {
        console.log('No user found')
        return
    }

    if (user.professionalId) {
        console.log(`User ${user.name} is already linked to a professional.`)
        return
    }

    // Find a professional not linked to any user
    const linkedProfessionalIds = (await prisma.user.findMany({
        select: { professionalId: true },
        where: { professionalId: { not: null } }
    })).map(u => u.professionalId)

    let professional = await prisma.professional.findFirst({
        where: {
            clinicId: user.clinicId,
            id: { notIn: linkedProfessionalIds }
        }
    })

    if (!professional) {
        console.log('No available professional found, creating one...')
        professional = await prisma.professional.create({
            data: {
                name: user.name,
                clinicId: user.clinicId,
                active: true
            }
        })
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { professionalId: professional.id }
    })

    console.log(`Linked user ${user.name} to professional ${professional.name}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
