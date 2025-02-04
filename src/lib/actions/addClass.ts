'use server'
import { cookies } from 'next/headers'


interface AddClassData {
  title: string
  description: string
  place: string
  startDate: Date
  endDate: Date,
  teacher_id: number
}

export async function addClass(data: AddClassData) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('id')  
  const token = cookieStore.get('authToken')?.value;

  if (!userId) {
    throw new Error('User ID not found in cookies')
  }

  data.teacher_id = await parseInt(userId.value)
  console.log(data)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/create`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to add class')
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to add class' }
  }
}

