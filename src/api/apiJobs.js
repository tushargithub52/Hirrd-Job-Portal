import supabaseClient from "@/utils/supabase";

// Fetch Jobs
export async function getJobs(token, { location, company_id, searchQuery }) {
  const supabase = await supabaseClient(token);
  let query = supabase
    .from("jobs")
    .select("*, saved: saved_jobs(id), company: companies(name,logo_url)");

  if (location) {
    query = query.eq("location", location);
  }

  if (company_id) {
    query = query.eq("company_id", company_id);
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// save/unsave jobs logic
export async function saveJob(token, { alreadySaved }, saveData) {
  const supabase = await supabaseClient(token);

  if (alreadySaved) {
    const { data, error: deleteError } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("job_id", saveData.job_id)

    if (deleteError) {
      console.error("Error deleting Saved Jobs:", deleteError);
      return null;
    }

    return data;
  }

  else {
    const { data, error: insertError } = await supabase
      .from("saved_jobs")
      .insert([saveData])
      .select()

      if (insertError) {
        console.error("Error Inserting New Job:", insertError);
        return null;
      }

      return data;
  }
}

// single job
export async function getSingleJob(token, {job_id}) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
  .from('jobs')
  .select("*, company: companies(name,logo_url), applications: applications(*)")
  .eq("id", job_id)
  .single()

  if (error) {
    console.log("Error fetching single job: ", error)
    return null
  }

  return data;

}

// update hiring status
export async function updateHiringStatus(token, {job_id}, isOpen) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
  .from('jobs')
  .update({isOpen})
  .eq("id", job_id)
  .select()

  if (error) {
    console.log("Error Updating Hiring Status: ", error)
    return null
  }

  return data;

}