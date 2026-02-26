const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function apiResponse(
  path:string,
  options:RequestInit = {}
){
  const res = await fetch(`${API_URL}${path}`,{
    ...options,
    headers:{
      'Content-type':'application/json',
      ...(options.headers || {}),
    },
    credentials:'include',
  });

  const data = await res.json().catch(()=>({}));
  if(!res.ok){
    throw new Error(data.message || 'Request failed');
  }
  return data;
}