import { getCompanies } from '@/api/apiCompanies'
import { getJobs } from '@/api/apiJobs'
import JobCard from '@/components/JobCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import useFetch from '@/hooks/use-fetch'
import { useUser } from '@clerk/clerk-react'
import { State } from 'country-state-city'
import React, { useEffect, useState } from 'react'
import { BarLoader } from 'react-spinners'

const JobListing = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [company_id, setCompany_id] = useState("");

  const { isLoaded } = useUser()

  const {
    fn: fnJobs,
    data: jobs,
    loading: loadingJobs,
  } = useFetch(getJobs, {
    location,
    company_id,
    searchQuery,
  });

  const {
    fn: fnCompanies,
    data: companies,
  } = useFetch(getCompanies);

  console.log(jobs);

  useEffect(() => {
    if (isLoaded) {
      fnCompanies();
    }
  }, [isLoaded]);
  useEffect(() => {
    if (isLoaded) {
      fnJobs();
    }
  }, [location, company_id, searchQuery, isLoaded]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target)

    const query = formData.get("search-query");

    if (query) {
      setSearchQuery(query);
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setLocation('')
    setCompany_id('')
  }

  if (!isLoaded) {
    return <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
  }

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-6xl sm:text-7xl text-center pb-8">
        Latest Jobs
      </h1>

      {/* our filters */}
      <form onSubmit={handleSearch} className='h-14 w-full flex gap-2 items-center mb-3'>
        <Input name='search-query' type='text' placeholder='Search Jobs by Title...' className="h-full flex-1 px-4 text-md" />
        <Button variant="blue" type="submit" className="h-full sm:w-28" >Submit</Button>
      </form>

      <div className='flex flex-col sm:flex-row gap-2 mb-3' >
        <Select value={location} onValueChange={(value) => setLocation(value)} >
          <SelectTrigger>
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {State.getStatesOfCountry("IN").map(({ name }) => {
                return (
                  <SelectItem value={name} key={name}>{name}</SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={company_id} onValueChange={(value) => setCompany_id(value)} >
          <SelectTrigger>
            <SelectValue placeholder="Filter by Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Array.isArray(companies) && companies.map(({ name, id }) => {
                return (
                  <SelectItem value={id} key={id}>
                    {name}
                  </SelectItem>
                );
              })}

            </SelectGroup>
          </SelectContent>
        </Select>

        <Button variant="destructive" className="sm:w-1/2" onClick={clearFilters} >Clear Filters</Button>
      </div>

      {loadingJobs && (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      )}

      {loadingJobs === false && (
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs?.length ? (
            jobs.map((job) => {
              return (
                <JobCard
                  key={job.id}
                  job={job}
                  savedInit={job?.saved?.length > 0}
                />
              );
            })
          ) : (
            <div>No Jobs Found 😢</div>
          )}
        </div>
      )}

    </div>
  )
}

export default JobListing;