import { Link } from 'react-router'
import PageFrame from '../shared/ui/PageFrame.tsx'
export default function NotFoundPage() {
  return (
    <PageFrame title="Page not found">
      <p>404: We could not find that page.</p>
      <Link className="button" to="/">
        Return to Home
      </Link>
    </PageFrame>
  )
}
