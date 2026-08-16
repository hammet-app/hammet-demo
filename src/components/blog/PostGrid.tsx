import { Post } from '@/lib/content/types'
import PostCard from './PostCard'

type PostGridProps = {
  posts: Post[]
}

export default function PostGrid({posts}: PostGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <PostCard key={post._id} post={post} index={index} />
      ))}
    </div>
  )
}