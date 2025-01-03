import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const user = await getUserFromToken(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const projectId = searchParams.get('projectId')

  let whereClause: any = { userId: user.id }

  if (date) {
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1)

    whereClause.dueDate = {
      gte: startDate,
      lt: endDate,
    }
  }

  if (projectId) {
    whereClause.projectId = projectId
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    include: { project: true },
  })

  return NextResponse.json(tasks)
}

export async function POST(request: NextRequest) {
  const user = await getUserFromToken(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const task = await prisma.task.create({
    data: {
      ...body,
      userId: user.id,
    },
  })
  return NextResponse.json(task)
}

