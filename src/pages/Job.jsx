import { getSingleJob, updateHiringStatus } from '@/api/apiJobs'
import Applicationcard from '@/components/applicationcard'
import ApplyJobDrawer from '@/components/apply-job'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import useFetch from '@/hooks/use-fetch'
import { useUser } from '@clerk/clerk-react'
import MDEditor from '@uiw/react-md-editor'
import { Briefcase, DoorClosed, DoorOpen, MapPinIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { BarLoader } from 'react-spinners'

const Job = () => {

  const { isLoaded, user } = useUser()

  const { id } = useParams()

  const {
    loading: loadingJob,
    data: job,
    fn: fnJob
  } = useFetch(getSingleJob, {
    job_id: id,
  })

  const {
    loading: loadingHiringStatus,
    fn: fnHiringStatus
  } = useFetch(updateHiringStatus, {
    job_id: id,
  })

  const handleStatusChange = (value) => {
    const isOpen = value === "open"
    fnHiringStatus(isOpen).then(fnJob());
  }

  useEffect(() => {
    if (isLoaded) {
      fnJob()
    }
  }, [isLoaded])

  if (!isLoaded || loadingJob) {
    return <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
  }

  return (
    <div className='flex flex-col gap-8 mt-5'>

      <div className='flex flex-col-reverse md:flex-row gap-6 justify-between items-center'>
        <h1 className="gradient-title font-extrabold text-4xl sm:text-6xl pb-3">{job?.title}</h1>
        <img src={job?.company?.logo_url} alt={job?.title} className='h-12' />
      </div>

      <div className='flex justify-between'>
        <div className="flex gap-2">
          <MapPinIcon />
          {job?.location}
        </div>
        <div className="flex gap-2">
          <Briefcase />
          {job?.applications?.length} Applicants
        </div>
        <div className="flex gap-2">
          {job?.isOpen ? (
            <>
              <DoorOpen /> Open
            </>
          ) : (
            <>
              <DoorClosed /> Closed
            </>
          )}
        </div>
      </div>

      {/* hiring status */}
      {loadingHiringStatus && <BarLoader width={"100%"} color="#36d7b7" />}
      {job?.recruiter_id === user?.id && (
        <Select onValueChange={handleStatusChange} >
          <SelectTrigger className={`w-full ${job?.isOpen ? "bg-green-950" : "bg-red-950"}`} >
            <SelectValue placeholder={"Hiring Status" + job?.isOpen ? "( Open )" : "( Closed )"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      )}

      <h2 className="text-2xl font-bold sm:text-3xl">About the Job</h2>
      <p className="sm:text-lg">{job?.description}</p>
      <h2 className="text-2xl font-bold sm:text-3xl">What we are Looking For</h2>
      <MDEditor.Markdown source={job?.requirements} className='bg-transparent sm:text-lg' />

      {/* Render Applications  */}
      {job?.recruiter_id !== user?.id && (
        <ApplyJobDrawer
          job={job}
          fetchJob={fnJob}
          user={user}
          applied={job?.applications?.find((ap) => ap.candidate_id === user.id)}
        />
      )}

      {job?.applications?.length > 0 && job?.recruiter_id === user?.id && (
        <div className='flex flex-col gap-2'>
          <h2 className="text-2xl font-bold sm:text-3xl">Applications</h2>
          {job?.applications.map((application) => {
            return (
              <Applicationcard key={application.id} application={application} />
            )
          })}
        </div>
      )}

    </div>
  )
}

export default Job