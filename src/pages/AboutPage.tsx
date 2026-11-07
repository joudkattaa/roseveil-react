import PageFrame from '../shared/ui/PageFrame.tsx'
import AboutSection from '../components/editorial/AboutSection.tsx'
import BeautyPromise from '../components/editorial/BeautyPromise.tsx'
export default function AboutPage() {
  return (
    <PageFrame title="About ROSEVEIL" width="full">
      <AboutSection storyId="about-story" />
      <BeautyPromise headingId="promise-title" />
    </PageFrame>
  )
}
