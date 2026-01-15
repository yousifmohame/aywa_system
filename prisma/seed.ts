// prisma/seed.ts
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // 1. إنشاء الأقسام أولاً (لأن الموظفين يعتمدون عليها)
  const csDepartment = await prisma.department.upsert({
    where: { name: 'خدمة العملاء' },
    update: {},
    create: {
      name: 'خدمة العملاء',
      description: 'استقبال المكالمات وحل مشاكل العملاء',
    },
  })

  const fulfillmentDepartment = await prisma.department.upsert({
    where: { name: 'تجهيز الطلبات' },
    update: {},
    create: {
      name: 'تجهيز الطلبات',
      description: 'تجهيز وتغليف الطلبات للشحن',
    },
  })

  console.log('Created Departments:', csDepartment.name, fulfillmentDepartment.name)

  // 2. إنشاء المدير (لا يحتاج لقسم محدد أو يمكن تركه فارغاً)
  const manager = await prisma.user.upsert({
    where: { email: 'manager@aiwa.com' },
    update: {},
    create: {
      email: 'manager@aiwa.com',
      fullName: 'المدير العام',
      password: 'password123', // تذكر: في الواقع يجب أن تكون مشفرة
      role: 'MANAGER',
      isOvertimeEnabled: true,
    },
  })

  // 3. إنشاء موظف وربطه بقسم خدمة العملاء
  const employee = await prisma.user.upsert({
    where: { email: 'cs@aiwa.com' },
    update: {},
    create: {
      email: 'cs@aiwa.com',
      fullName: 'أحمد محمد',
      password: 'password123',
      role: 'EMPLOYEE',
      isOvertimeEnabled: true,
      // هنا الربط الصحيح بالقسم
      department: {
        connect: { id: csDepartment.id }
      }
    },
  })

  // 4. إنشاء موظف ثاني وربطه بقسم التجهيز
  const employee2 = await prisma.user.upsert({
    where: { email: 'order@aiwa.com' },
    update: {},
    create: {
      email: 'order@aiwa.com',
      fullName: 'سارة خالد',
      password: 'password123',
      role: 'EMPLOYEE',
      isOvertimeEnabled: false,
      department: {
        connect: { id: fulfillmentDepartment.id }
      }
    },
  })

  console.log({ manager, employee, employee2 })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })