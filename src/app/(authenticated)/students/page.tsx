import { requireAuth } from '@/lib/auth-utils'
import { getStudents } from '@/lib/data/students'
import { StudentsClient } from './_components/students-client'

interface SearchParams {
  page?: string
  search?: string
  status?: string
}

export default async function StudentsPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  await requireAuth()
  
  const { students, pagination } = await getStudents({
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    search: searchParams.search,
    status: (searchParams.status as 'active' | 'inactive' | 'all') || 'active'
  })
  
  return (
    <StudentsClient 
      initialStudents={students} 
      initialPagination={pagination}
      initialSearch={searchParams.search}
      initialStatus={searchParams.status}
    />
  )
}