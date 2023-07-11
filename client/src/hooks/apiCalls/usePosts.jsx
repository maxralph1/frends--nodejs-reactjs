import { useState, useEffect } from 'react'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
// import { axiosPrivate } from "@/api/axios";
 
export function usePosts() {
  const [posts, setPosts] = useState([])
  const axiosPrivate = useAxiosPrivate();
 
  useEffect(() => {
    const controller = new AbortController()
    getPosts({ signal: controller.signal })
    return () => { controller.abort() }
  }, [])
 
  async function getPosts({ signal } = {}) {
    return axiosPrivate.get('/posts', { signal })
      .then(response => setPosts(response.data.data))
      .catch(() => {})
  }
 
  return { posts, getPosts }
}
